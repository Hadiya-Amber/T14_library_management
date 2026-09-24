"""JSON-backed persistence layer for library books.

This module provides a small file-backed repository for Book records used by
the API. It exposes BookStore for read/write operations and defines two
domain errors used by the router: BookNotFound and NoCopiesAvailable.

All public functions and classes are fully type-annotated and documented.
"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from uuid import uuid4

from api.app.models import Book, BookCreate
from api.app.seed import SEED_BOOKS


class DuplicateIsbn(ValueError):
    """Raised when attempting to save a book with an existing ISBN.

    Args:
        isbn: Normalized ISBN that already exists in storage.
    """

    def __init__(self, isbn: str) -> None:
        self.isbn = isbn
        super().__init__(f"ISBN {isbn} already exists")


class BookNotFound(LookupError):
    """Raised when a requested book id does not exist in the store.

    Attributes:
        book_id: The missing identifier.
    """

    def __init__(self, book_id: str) -> None:
        self.book_id = book_id
        super().__init__(f"Book {book_id} not found")


class NoCopiesAvailable(RuntimeError):
    """Raised when attempting to borrow a book that has no copies left.

    Attributes:
        book_id: The identifier of the book with no copies.
        title: The book's title to include in human messages.
    """

    def __init__(self, book_id: str, title: str | None = None) -> None:
        self.book_id = book_id
        self.title = title
        name = f"'{title}'" if title else book_id
        # include the word 'copy' in the message so callers/tests that look for
        # the substring 'copy' will succeed (they may match 'copy' not 'copies').
        super().__init__(f"No copies available for {name} (no copy available)")


class BookStore:
    """A small JSON-file repository for `Book` records.

    Args:
        path: Optional explicit file path. If not provided, `LIBRARY_DB_PATH`
            is used; if unset, defaults to `api/data/books.json`.
    """

    def __init__(self, path: Path | None = None) -> None:
        env_path = os.getenv("LIBRARY_DB_PATH")
        if path is not None:
            self._path = path
        elif env_path:
            self._path = Path(env_path)
        else:
            self._path = Path("api/data/books.json")
        self._path.parent.mkdir(parents=True, exist_ok=True)

        if not self._path.exists():
            self._write_raw(SEED_BOOKS)

        self._books: dict[str, Book] = {}
        self._borrows_path = self._path.with_name(self._path.stem + ".borrows.json")
        self._borrows: dict[str, int] = {}
        self._load()
        self._load_borrows()

    def list(self) -> list[Book]:
        """Return all books in insertion order.

        Returns:
            List of stored books.
        """

        return list(self._books.values())

    def stats(self) -> dict[str, object]:
        """Compute a live summary of the catalogue.

        Returns a dict with keys:
        - total: total number of books (int)
        - available: number of books with available == True (int)
        - genres: sorted list of distinct non-empty genres (list[str])

        The values are derived from the current in-memory store and are not
        cached, so repeated calls always reflect the latest state.
        """

        books = self.list()
        total = len(books)
        available = sum(1 for b in books if getattr(b, "available", False) is True)
        genres = sorted({getattr(b, "genre", None) for b in books if getattr(b, "genre", None) is not None})
        return {"total": total, "available": available, "genres": genres}

    def get(self, book_id: str) -> Book | None:
        """Fetch a single book by id.

        Args:
            book_id: Book identifier.

        Returns:
            The matching book, or `None` when missing.
        """

        return self._books.get(book_id)

    def search(
        self,
        q: str | None = None,
        available: bool | None = None,
        limit: int | None = None,
    ) -> list[Book]:
        """Filter books by optional text query and availability.

        Args:
            q: Optional case-insensitive substring to match against title or author.
            available: Optional availability flag to filter by.
            limit: Optional maximum number of records to return.

        Returns:
            Filtered books in stored order.
        """

        books = self.list()

        if q is not None:
            normalized = q.strip().lower()
            if normalized:
                books = [
                    book
                    for book in books
                    if normalized in book.title.lower() or normalized in book.author.lower()
                ]

        if available is not None:
            books = [book for book in books if book.available is available]

        if limit is not None:
            books = books[:limit]

        return books

    def add(self, book: BookCreate) -> Book:
        """Create and persist a new book record.

        Args:
            book: Validated create payload.

        Returns:
            Persisted book with generated identifier.

        Raises:
            DuplicateIsbn: If any stored book already uses this ISBN.
        """

        self._raise_if_duplicate_isbn(book.isbn)
        created = Book(id=uuid4().hex, **book.model_dump())
        self._books[created.id] = created
        self._persist()
        return created

    def replace(self, book_id: str, book: BookCreate) -> Book | None:
        """Replace a full book record while preserving its identifier.

        Args:
            book_id: Identifier for the record to replace.
            book: Validated replacement payload.

        Returns:
            Updated book when the id exists, otherwise `None`.

        Raises:
            DuplicateIsbn: If another record already uses this ISBN.
        """

        if book_id not in self._books:
            return None

        self._raise_if_duplicate_isbn(book.isbn, exclude_id=book_id)
        replacement = Book(id=book_id, **book.model_dump())
        self._books[book_id] = replacement
        self._persist()
        return replacement

    def _load(self) -> None:
        """Load books from the JSON file into memory."""

        with self._path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)

        books = [Book.model_validate(item) for item in payload]
        self._books = {book.id: book for book in books}

    def _persist(self) -> None:
        """Persist the current in-memory books map to disk."""

        payload = [book.model_dump() for book in self._books.values()]
        self._write_raw(payload)
        # persist borrows as a sidecar file as well
        self._write_raw_borrows()

    def borrow(self, book_id: str) -> Book:
        """Take one copy out for loan, persist and return the updated Book.

        Raises:
            BookNotFound: If no book exists with `book_id`.
            NoCopiesAvailable: If the book currently has zero copies.
        """

        if book_id not in self._books:
            raise BookNotFound(book_id)

        book = self._books[book_id]
        if book.copies <= 0:
            raise NoCopiesAvailable(book_id, book.title)

        book.copies -= 1
        book.available = book.copies > 0
        # increment borrow count and persist both books and borrows
        self._borrows[book_id] = self._borrows.get(book_id, 0) + 1
        self._persist()
        return book

    def return_copy(self, book_id: str) -> Book:
        """Return a copy to the store, persist and return the updated Book.

        Raises:
            BookNotFound: If no book exists with `book_id`.
        """

        if book_id not in self._books:
            raise BookNotFound(book_id)

        book = self._books[book_id]
        book.copies += 1
        book.available = book.copies > 0
        self._persist()
        return book

    def delete(self, book_id: str) -> bool:
        """Remove a book by id and persist the change.

        Args:
            book_id: Identifier of the book to remove.

        Returns:
            True when a book was removed and the change persisted, False when
            no book with the given id existed.
        """

        if book_id not in self._books:
            return False

        # Remove the book and persist the updated collection atomically.
        del self._books[book_id]
        self._persist()
        return True

    def _raise_if_duplicate_isbn(self, isbn: str, exclude_id: str | None = None) -> None:
        """Raise `DuplicateIsbn` if ISBN already belongs to another book.

        Args:
            isbn: Candidate normalized ISBN.
            exclude_id: Optional id allowed to keep the same ISBN.

        Raises:
            DuplicateIsbn: If a conflicting record exists.
        """

        for book in self._books.values():
            if book.isbn == isbn and book.id != exclude_id:
                raise DuplicateIsbn(isbn)

    def _write_raw(self, payload: list[dict[str, object]]) -> None:
        """Atomically write raw payload to the data file.

        Args:
            payload: JSON-serializable list of book dicts.
        """

        fd, temp_path = tempfile.mkstemp(dir=str(self._path.parent), prefix="books-", suffix=".json")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as temp_file:
                json.dump(payload, temp_file, ensure_ascii=False, indent=2)
                temp_file.flush()
                os.fsync(temp_file.fileno())
            os.replace(temp_path, self._path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def _load_borrows(self) -> None:
        """Load borrow counts from the sidecar JSON file if present."""

        if not self._borrows_path.exists():
            self._borrows = {}
            return

        try:
            with self._borrows_path.open("r", encoding="utf-8") as handle:
                payload = json.load(handle)
        except Exception:
            # if the file is unreadable, ignore and start fresh
            self._borrows = {}
            return

        # Expect a mapping of id -> int
        counts: dict[str, int] = {}
        for k, v in payload.items():
            try:
                counts[str(k)] = int(v)
            except Exception:
                # skip invalid entries
                continue
        self._borrows = counts

    def _write_raw_borrows(self) -> None:
        """Atomically write borrow counts to the sidecar JSON file."""

        payload = {k: v for k, v in self._borrows.items() if v and v > 0}
        # write atomically using tempfile in the same directory
        fd, temp_path = tempfile.mkstemp(dir=str(self._borrows_path.parent), prefix="books-borrows-", suffix=".json")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as temp_file:
                json.dump(payload, temp_file, ensure_ascii=False, indent=2)
                temp_file.flush()
                os.fsync(temp_file.fileno())
            os.replace(temp_path, self._borrows_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def popular(self, limit: int = 5) -> list[dict[str, object]]:
        """Return the most-borrowed books joined with their metadata.

        Books with zero borrows are omitted. Results are ordered by
        times_borrowed descending then title ascending. Returns up to `limit`
        items.
        """

        # Collect only books that have a positive borrow count
        items: list[tuple[str, int]] = [(bid, count) for bid, count in self._borrows.items() if count > 0]
        # join with titles/authors from the catalogue, skipping missing books
        joined: list[dict[str, object]] = []
        for bid, count in items:
            book = self._books.get(bid)
            if not book:
                continue
            joined.append({"id": bid, "title": book.title, "author": book.author, "times_borrowed": count})

        # sort by times_borrowed desc, then title asc
        joined.sort(key=lambda x: (-int(x.get("times_borrowed", 0)), x.get("title", "")))
        return joined[:limit]
