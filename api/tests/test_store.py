import pytest

from api.app.models import Book
from api.app.store import BookStore


@pytest.fixture
def db_path(tmp_path, monkeypatch):
    path = tmp_path / "library.json"
    monkeypatch.setenv("LIBRARY_DB_PATH", str(path))
    return path


def test_bookstore_creates_missing_file_and_seeds_expected_books(db_path):
    assert not db_path.exists()

    store = BookStore()

    assert db_path.exists()

    books = store.list()
    assert len(books) == 6
    assert all(isinstance(book, Book) for book in books)

    titles = {book.title for book in books}
    assert "Malgudi Days" in titles
    assert "Pride and Prejudice" in titles


def test_bookstore_get_returns_seeded_book_and_none_for_missing_id(db_path):
    store = BookStore()

    found = store.get("2")
    missing = store.get("nope")

    assert found is not None
    assert found.title == "Pride and Prejudice"
    assert missing is None
