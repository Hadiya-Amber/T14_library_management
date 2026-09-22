import pytest
from fastapi.testclient import TestClient

from api.app.main import app
from api.app.store import BookStore


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Ensure each test gets a fresh seeded store on disk
    monkeypatch.setenv("LIBRARY_DB_PATH", str(tmp_path / "library.json"))
    return TestClient(app)


@pytest.fixture
def store(tmp_path, monkeypatch):
    monkeypatch.setenv("LIBRARY_DB_PATH", str(tmp_path / "library.json"))
    return BookStore()


def _compute_expected_from_books_list(books_list: list[dict]) -> dict:
    total = len(books_list)
    available = sum(1 for b in books_list if b.get("available") is True)
    genres = sorted({b.get("genre") for b in books_list if b.get("genre") is not None})
    return {"total": total, "available": available, "genres": genres}


def test_books_stats_matches_get_books(client, store):
    # Fetch canonical source of truth
    books_resp = client.get("/books")
    assert books_resp.status_code == 200
    books = books_resp.json()
    assert isinstance(books, list)

    expected = _compute_expected_from_books_list(books)

    stats_resp = client.get("/books/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()

    # Assert each invariant from acceptance criteria
    assert stats.get("total") == expected["total"]
    assert stats.get("available") == expected["available"]
    # genres should be the sorted distinct genres
    assert stats.get("genres") == expected["genres"]


def test_books_stats_total_decreases_after_delete(client, store):
    # Start from seeded state
    books_resp = client.get("/books")
    assert books_resp.status_code == 200
    books = books_resp.json()
    assert len(books) >= 1

    stats_resp = client.get("/books/stats")
    assert stats_resp.status_code == 200
    before_stats = stats_resp.json()
    before_total = before_stats.get("total")
    assert isinstance(before_total, int)

    # Delete the first book returned by /books
    book_id = books[0]["id"]
    delete_resp = client.delete(f"/books/{book_id}")
    assert delete_resp.status_code == 204

    # Re-fetch stats and assert total decreased by one
    after_stats_resp = client.get("/books/stats")
    assert after_stats_resp.status_code == 200
    after_stats = after_stats_resp.json()

    assert after_stats.get("total") == before_total - 1


def test_openapi_declares_books_stats_200(client):
    openapi_resp = client.get("/openapi.json")
    assert openapi_resp.status_code == 200
    spec = openapi_resp.json()

    assert "paths" in spec and isinstance(spec["paths"], dict)
    paths = spec["paths"]

    # The OpenAPI spec must document /books/stats and include a 200 response for GET
    assert "/books/stats" in paths
    stats_path = paths["/books/stats"]
    assert "get" in stats_path
    get_op = stats_path["get"]
    assert "responses" in get_op and "200" in get_op["responses"]
