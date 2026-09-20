"""JSON-backed persistence layer for library books."""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

from api.app.models import Book
from api.app.seed import SEED_BOOKS


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
        self._load()

    def list(self) -> list[Book]:
        """Return all books in insertion order.

        Returns:
            List of stored books.
        """

        return list(self._books.values())

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

    def _load(self) -> None:
        """Load books from the JSON file into memory."""

        with self._path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)

        books = [Book.model_validate(item) for item in payload]
        self._books = {book.id: book for book in books}

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
