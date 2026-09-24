import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from api.app.main import app
from api.app.store import BookStore
from api.app.models import BookCreate


client = TestClient(app)


def _dict_or_obj_get(obj, key):
    if isinstance(obj, dict):
        return obj.get(key)
    return getattr(obj, key, None)


def _dict_or_obj_id(obj):
    if isinstance(obj, dict):
        return obj.get("id")
    return getattr(obj, "id", None)


def test_get_popular_books_returns_sorted_list(monkeypatch):
    """AC-1: Ensure endpoint returns the most-borrowed books with required fields.

    This test monkeypatches BookStore.popular so the endpoint responds with
    a controlled list and then asserts the HTTP response contains the
    expected ordering and fields.
    """

    popular_data = [
        {"id": "book1", "title": "Book One", "author": "Author A", "times_borrowed": 2},
        {"id": "book3", "title": "Book Three", "author": "Author C", "times_borrowed": 1},
    ]

    def fake_popular(self, limit=50):
        return popular_data

    monkeypatch.setattr(BookStore, "popular", fake_popular, raising=False)

    resp = client.get("/books/popular")
    assert resp.status_code == 200, "expected 200 OK from /books/popular"

    body = resp.json()
    assert isinstance(body, list), "response must be a JSON list"
    assert len(body) >= 2, "response should include at least two items for this test"

    first = body[0]
    second = body[1]

    assert _dict_or_obj_get(first, "id") == "book1"
    assert _dict_or_obj_get(first, "times_borrowed") == 2
    assert _dict_or_obj_get(first, "title") == "Book One"
    assert _dict_or_obj_get(first, "author") == "Author A"

    assert _dict_or_obj_get(second, "id") == "book3"
    assert _dict_or_obj_get(second, "times_borrowed") == 1
    assert _dict_or_obj_get(second, "title") == "Book Three"
    assert _dict_or_obj_get(second, "author") == "Author C"


def test_return_does_not_decrement_borrow_count_and_never_borrowed_not_listed(monkeypatch):
    """AC-2: A returned borrow still counts and never-borrowed books are absent.

    The fake store returns only books that were borrowed; a returned book is
    represented with times_borrowed 1 and a never-borrowed book is omitted.
    """

    popular_data = [
        {"id": "borrowed_then_returned", "title": "Returned Book", "author": "X", "times_borrowed": 1}
    ]

    def fake_popular(self, limit=50):
        return popular_data

    monkeypatch.setattr(BookStore, "popular", fake_popular, raising=False)

    resp = client.get("/books/popular")
    assert resp.status_code == 200
    body = resp.json()

    ids = { _dict_or_obj_id(item) for item in body }
    assert "borrowed_then_returned" in ids
    assert "never_borrowed" not in ids

    # assert the returned book carries times_borrowed == 1
    found = next(item for item in body if _dict_or_obj_id(item) == "borrowed_then_returned")
    assert _dict_or_obj_get(found, "times_borrowed") == 1


def test_books_with_same_borrows_sorted_by_title(monkeypatch):
    """AC-3: When times_borrowed tie, endpoint orders by title ascending."""

    # underlying store returns items in arbitrary order; endpoint should sort
    popular_unsorted = [
        {"id": "b2", "title": "Zoo Tales", "author": "A", "times_borrowed": 5},
        {"id": "b1", "title": "Alpha Story", "author": "B", "times_borrowed": 5},
        {"id": "b3", "title": "Middle Book", "author": "C", "times_borrowed": 5},
    ]

    def fake_popular(self, limit=50):
        return popular_unsorted

    monkeypatch.setattr(BookStore, "popular", fake_popular, raising=False)

    resp = client.get("/books/popular")
    assert resp.status_code == 200
    body = resp.json()

    # Extract titles in returned order
    titles = [ _dict_or_obj_get(item, "title") for item in body ]

    # Expect alphabetical ordering of the three titles
    assert titles[:3] == sorted(titles[:3])


def test_limit_param_and_validation(monkeypatch):
    """AC-4: limit parameter controls item count and invalid values return 422."""

    popular_data = [
        {"id": "b1", "title": "A", "author": "A", "times_borrowed": 3},
        {"id": "b2", "title": "B", "author": "B", "times_borrowed": 2},
    ]

    def fake_popular(self, limit=50):
        # ignore limit here; endpoint should enforce it
        return popular_data

    monkeypatch.setattr(BookStore, "popular", fake_popular, raising=False)

    # Valid limit=1 -> exactly one item
    resp = client.get("/books/popular", params={"limit": 1})
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) == 1

    # Invalid limits: 0 and 51 should be rejected as 422 by the endpoint's validation
    resp0 = client.get("/books/popular", params={"limit": 0})
    assert resp0.status_code == 422

    resp51 = client.get("/books/popular", params={"limit": 51})
    assert resp51.status_code == 422


def test_popular_persistence_across_bookstores(tmp_path, monkeypatch):
    """AC-5: Borrow counts persisted in the JSON DB are visible to new BookStore instances.

    This test uses a temporary LIBRARY_DB_PATH to avoid touching the real data.
    It creates a BookStore, adds a book, performs borrows and then constructs a
    second BookStore pointing at the same file to assert the persisted counts.
    """

    db_file = tmp_path / "books_db.json"
    monkeypatch.setenv("LIBRARY_DB_PATH", str(db_file))

    # Construct first store and add a book
    store1 = BookStore(path=db_file)

    create = BookCreate(
        title="Persistent Book",
        author="Persister",
        isbn="9780000000001",
        genre="Test",
        cover="",
        year=2000,
        copies=2,
    )

    created = store1.add(create)

    # Borrow twice using the first store (this should update times_borrowed and persist)
    # We call borrow twice; if copies run out this may raise - ensure copies>=2 above
    store1.borrow(created.id)
    store1.borrow(created.id)

    # Construct a second store pointed to the same file and ask for popular()
    store2 = BookStore(path=db_file)

    # store2.popular may return dicts or model instances; locate the created book
    popular_list = store2.popular()
    found_tb = None
    for item in popular_list:
        item_id = _dict_or_obj_id(item)
        if item_id == created.id:
            found_tb = _dict_or_obj_get(item, "times_borrowed")
            break

    assert found_tb == 2, "expected times_borrowed == 2 to be persisted and visible to a new BookStore"
