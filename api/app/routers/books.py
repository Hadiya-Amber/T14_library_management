"""Read and write endpoints for the library catalogue."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from api.app.models import Book, BookCreate
from api.app.store import BookStore, DuplicateIsbn

router = APIRouter(prefix="/books", tags=["books"])


def get_store() -> BookStore:
    """Build a store instance for request handlers.

    Returns:
        A book repository bound to the configured JSON path.
    """

    return BookStore()


@router.get("", response_model=list[Book])
def list_books(
    store: Annotated[BookStore, Depends(get_store)],
    q: str | None = None,
    available: bool | None = None,
    limit: int = Query(default=50, ge=1, le=200),
) -> list[Book]:
    """Return books filtered by query and availability.

    Args:
        store: Store dependency for reading books.
        q: Optional case-insensitive substring for title/author matching.
        available: Optional availability filter.
        limit: Maximum number of books to return.

    Returns:
        Matching books in seed/storage order, capped to `limit`.
    """

    return store.search(q=q, available=available, limit=limit)


@router.get("/{book_id}", response_model=Book)
def get_book(book_id: str, store: Annotated[BookStore, Depends(get_store)]) -> Book:
    """Return a single book by identifier.

    Args:
        book_id: Book identifier.
        store: Store dependency for reading books.

    Returns:
        The matching book.

    Raises:
        HTTPException: If the book does not exist.
    """

    book = store.get(book_id)
    if book is None:
        raise HTTPException(status_code=404, detail=f"Book {book_id} not found")
    return book


@router.post("", response_model=Book, status_code=201)
def create_book(book: BookCreate, store: Annotated[BookStore, Depends(get_store)]) -> Book:
    """Create a new book record.

    Args:
        book: Validated create payload.
        store: Store dependency for persisting books.

    Returns:
        Newly created persisted book.

    Raises:
        HTTPException: If a duplicate ISBN already exists.
    """

    try:
        return store.add(book)
    except DuplicateIsbn as exc:
        raise HTTPException(status_code=409, detail=f"ISBN {exc.isbn} already exists") from exc


@router.put("/{book_id}", response_model=Book)
def replace_book(
    book_id: str,
    book: BookCreate,
    store: Annotated[BookStore, Depends(get_store)],
) -> Book:
    """Replace an existing book while keeping its identifier.

    Args:
        book_id: Identifier of the book to replace.
        book: Validated replacement payload.
        store: Store dependency for persisting books.

    Returns:
        Updated persisted book.

    Raises:
        HTTPException: If no book exists for id or ISBN conflicts.
    """

    try:
        replacement = store.replace(book_id, book)
    except DuplicateIsbn as exc:
        raise HTTPException(status_code=409, detail=f"ISBN {exc.isbn} already exists") from exc

    if replacement is None:
        raise HTTPException(status_code=404, detail=f"Book {book_id} not found")
    return replacement
