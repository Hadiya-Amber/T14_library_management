"""Domain models for the library API."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class BookCreate(BaseModel):
    """Request model for creating or replacing a book record.

    Args:
        title: Human-readable book title.
        author: Book author name.
        isbn: ISBN-13 value, accepted with optional hyphens.
        genre: Book genre label.
        cover: Absolute URL or `/covers/...` path, may be empty.
        year: Publication year from 1450 to 2100.
        copies: Count of copies held by the library.
        available: Optional availability flag. If omitted, derived from copies.
    """

    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=120)
    isbn: str
    genre: str
    cover: str = ""
    year: int = Field(ge=1450, le=2100)
    copies: int = Field(ge=0)
    available: bool | None = None

    @field_validator("isbn", mode="before")
    @classmethod
    def normalize_isbn(cls, value: Any) -> str:
        """Normalize ISBN by removing hyphens and validating digit length.

        Args:
            value: Raw ISBN value.

        Returns:
            A 13-digit ISBN string without separators.

        Raises:
            ValueError: If the provided ISBN is not exactly 13 digits.
        """

        normalized = str(value).replace("-", "")
        if not normalized.isdigit() or len(normalized) != 13:
            raise ValueError(f"isbn must be 13 digits after normalization: {value!r}")
        return normalized

    @field_validator("cover")
    @classmethod
    def validate_cover(cls, value: str) -> str:
        """Validate supported cover reference formats.

        Args:
            value: Cover image path or URL.

        Returns:
            The original cover string.

        Raises:
            ValueError: If the value is neither empty, a URL, nor `/covers/...`.
        """

        if value == "" or value.startswith("/covers/"):
            return value

        parsed = urlparse(value)
        if parsed.scheme in {"http", "https"} and parsed.netloc:
            return value

        raise ValueError(f"cover must be empty, URL, or /covers path: {value!r}")

    @model_validator(mode="after")
    def derive_available(self) -> "BookCreate":
        """Derive availability from copies when unavailable is omitted.

        Returns:
            The validated input model.
        """

        if self.available is None:
            self.available = self.copies > 0
        return self


class Book(BookCreate):
    """A persisted library book.

    Args:
        id: Stable identifier for the book record.
    """

    id: str
