from fastapi.testclient import TestClient
import pytest

from api.app.main import app
from api.app.store import BookStore


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("LIBRARY_DB_PATH", str(tmp_path / "library.json"))
    return TestClient(app)


@pytest.fixture
def store(tmp_path, monkeypatch):
    monkeypatch.setenv("LIBRARY_DB_PATH", str(tmp_path / "library.json"))
    return BookStore()


def test_get_books_returns_seeded_books_in_order_with_required_fields(client):
    response = client.get("/books")

    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) == 6
    assert [book["id"] for book in payload] == ["1", "2", "3", "4", "5", "6"]

    required_keys = {
        "id",
        "title",
        "author",
        "isbn",
        "genre",
        "cover",
        "year",
        "copies",
        "available",
    }
    for book in payload:
        assert required_keys.issubset(book.keys())


def test_get_books_q_filter_is_case_insensitive_for_seeded_titles(client):
    narayan = client.get("/books", params={"q": "narayan"})
    pride = client.get("/books", params={"q": "PRIDE"})

    assert narayan.status_code == 200
    narayan_payload = narayan.json()
    assert len(narayan_payload) == 1
    assert narayan_payload[0]["title"] == "Malgudi Days"

    assert pride.status_code == 200
    pride_payload = pride.json()
    assert len(pride_payload) == 1
    assert pride_payload[0]["title"] == "Pride and Prejudice"


def test_get_books_available_true_returns_only_available_books(client):
    response = client.get("/books", params={"available": "true"})

    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) > 0
    assert all(book["available"] is True for book in payload)


def test_get_books_limit_applies_and_invalid_bounds_return_422(client):
    limited = client.get("/books", params={"limit": 2})
    too_low = client.get("/books", params={"limit": 0})
    too_high = client.get("/books", params={"limit": 201})

    assert limited.status_code == 200
    assert len(limited.json()) == 2

    assert too_low.status_code == 422
    assert too_high.status_code == 422


def test_get_book_by_id_returns_seeded_book_and_exact_404_detail(client):
    found = client.get("/books/2")
    missing = client.get("/books/does-not-exist")

    assert found.status_code == 200
    assert found.json()["title"] == "Pride and Prejudice"

    assert missing.status_code == 404
    assert missing.json() == {"detail": "Book does-not-exist not found"}


def test_bookstore_search_filters_by_query_available_and_limit(store):
    search = getattr(store, "search", None)
    assert callable(search)

    all_books = search()
    assert len(all_books) == 6
    assert [book.id for book in all_books] == ["1", "2", "3", "4", "5", "6"]

    narayan = search(q="narayan")
    assert [book.title for book in narayan] == ["Malgudi Days"]

    pride = search(q="PRIDE")
    assert [book.title for book in pride] == ["Pride and Prejudice"]

    available = search(available=True)
    assert len(available) > 0
    assert all(book.available is True for book in available)

    limited = search(limit=2)
    assert len(limited) == 2
