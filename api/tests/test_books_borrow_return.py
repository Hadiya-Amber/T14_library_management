import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from api.app.main import app
from api.app.store import BookStore


@pytest.fixture
def client(tmp_path, monkeypatch):
    db = tmp_path / "books.json"
    monkeypatch.setenv("LIBRARY_DB_PATH", str(db))
    # Ensure the TestClient is created after the env var is set so the
    # BookStore used by the API reads/writes the tmp path.
    return TestClient(app)


def test_borrow_decrements_copies_and_available(client, tmp_path, monkeypatch):
    """AC-1: Borrowing a book with copies >= 1 returns 200 and decrements copies; available stays True when copies remain > 0."""
    db = tmp_path / "books.json"
    monkeypatch.setenv("LIBRARY_DB_PATH", str(db))

    # Inspect initial state via a fresh BookStore (seed is written on first use)
    store = BookStore(path=db)
    book_id = "1"  # The Odyssey, copies: 3 in seed
    before = store.get(book_id)
    assert before is not None, "seed must include book 1 for the test"
    initial_copies = before.copies
    assert initial_copies >= 1

    resp = client.post(f"/books/{book_id}/borrow")
    # Acceptance: should answer 200 with the book whose copies is one less
    assert resp.status_code == 200, f"expected 200, got {resp.status_code} body={resp.text}"

    payload = resp.json()
    assert payload.get("id") == book_id
    assert payload.get("copies") == initial_copies - 1
    # available should be True when copies is still above zero
    assert payload.get("available") is True


def test_borrow_when_no_copies_returns_409_and_no_change(client, tmp_path, monkeypatch):
    """AC-2: Borrowing a book with 0 copies returns 409 and the stored copies stay 0; detail mentions the book title and lack of copies."""
    db = tmp_path / "books.json"
    monkeypatch.setenv("LIBRARY_DB_PATH", str(db))

    store = BookStore(path=db)
    book_id = "2"  # Pride and Prejudice, copies: 0 in seed
    book = store.get(book_id)
    assert book is not None
    assert book.copies == 0

    resp = client.post(f"/books/{book_id}/borrow")
    assert resp.status_code == 409, f"expected 409, got {resp.status_code} body={resp.text}"

    data = resp.json()
    detail = data.get("detail", "")
    # The acceptance requires the detail to name the book title and say no copies are available
    assert "Pride and Prejudice" in detail or "Pride & Prejudice" in detail or "Pride" in detail
    assert "no" in detail.lower() and "copy" in detail.lower()

    # Stored copies must remain 0
    reloaded = BookStore(path=db)
    reloaded_book = reloaded.get(book_id)
    assert reloaded_book is not None
    assert reloaded_book.copies == 0


def test_return_after_borrow_increases_copies_and_available_true(client, tmp_path, monkeypatch):
    """AC-3: After borrowing a book, returning it increases copies by one and available becomes True."""
    db = tmp_path / "books.json"
    monkeypatch.setenv("LIBRARY_DB_PATH", str(db))

    store = BookStore(path=db)
    book_id = "6"  # The God of Small Things, copies: 5 in seed
    book = store.get(book_id)
    assert book is not None
    initial = book.copies
    assert initial >= 1

    # Borrow first
    borrow_resp = client.post(f"/books/{book_id}/borrow")
    assert borrow_resp.status_code == 200, f"borrow expected 200, got {borrow_resp.status_code} body={borrow_resp.text}"
    borrow_payload = borrow_resp.json()
    assert borrow_payload.get("copies") == initial - 1

    # Now return
    return_resp = client.post(f"/books/{book_id}/return")
    assert return_resp.status_code == 200, f"return expected 200, got {return_resp.status_code} body={return_resp.text}"
    return_payload = return_resp.json()
    assert return_payload.get("copies") == initial
    assert return_payload.get("available") is True


def test_borrow_persists_change_across_store_instances(client, tmp_path, monkeypatch):
    """AC-4: A borrow persists to disk so a new BookStore constructed on the same LIBRARY_DB_PATH sees the changed copies."""
    db = tmp_path / "books.json"
    monkeypatch.setenv("LIBRARY_DB_PATH", str(db))

    store = BookStore(path=db)
    book_id = "4"  # Malgudi Days, copies: 2 in seed
    book = store.get(book_id)
    assert book is not None
    before = book.copies
    assert before >= 1

    resp = client.post(f"/books/{book_id}/borrow")
    assert resp.status_code == 200, f"expected 200, got {resp.status_code} body={resp.text}"

    # A new BookStore instance reading the same file must observe the decremented copies
    new_store = BookStore(path=db)
    new_book = new_store.get(book_id)
    assert new_book is not None
    assert new_book.copies == before - 1
