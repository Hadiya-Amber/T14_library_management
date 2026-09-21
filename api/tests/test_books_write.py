import re

import pytest
from fastapi.testclient import TestClient

from api.app.main import app
from api.app.store import BookStore


@pytest.fixture
def db_path(tmp_path, monkeypatch):
    path = tmp_path / "library.json"
    monkeypatch.setenv("LIBRARY_DB_PATH", str(path))
    return path


@pytest.fixture
def client(db_path):
    return TestClient(app)


def test_post_books_creates_book_normalizes_isbn_and_get_returns_record(client):
    payload = {
        "title": "When Breath Becomes Air",
        "author": "Paul Kalanithi",
        "isbn": "978-1-4165-6259-7",
        "genre": "Memoir",
        "cover": "/covers/when-breath-becomes-air.jpg",
        "year": 2016,
        "copies": 2,
    }

    created = client.post("/books", json=payload)

    assert created.status_code == 201
    created_body = created.json()
    assert re.fullmatch(r"[0-9a-f]{32}", created_body["id"]) is not None
    assert created_body["isbn"] == "9781416562597"
    assert created_body["available"] is True

    fetched = client.get(f"/books/{created_body['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == created_body


def test_post_books_invalid_payloads_return_422_with_validation_error_detail(client):
    invalid_payloads = [
        {
            "author": "Paul Kalanithi",
            "isbn": "978-1-4165-6259-7",
            "genre": "Memoir",
            "cover": "/covers/when-breath-becomes-air.jpg",
            "year": 2016,
            "copies": 2,
        },
        {
            "title": "When Breath Becomes Air",
            "author": "Paul Kalanithi",
            "isbn": "978-1-4165-6259-7",
            "genre": "Memoir",
            "cover": "/covers/when-breath-becomes-air.jpg",
            "year": 1449,
            "copies": 2,
        },
        {
            "title": "When Breath Becomes Air",
            "author": "Paul Kalanithi",
            "isbn": "978-1-4165-6259-7",
            "genre": "Memoir",
            "cover": "/covers/when-breath-becomes-air.jpg",
            "year": 2016,
            "copies": -1,
        },
        {
            "title": "When Breath Becomes Air",
            "author": "Paul Kalanithi",
            "isbn": "978-1-4165-6259",
            "genre": "Memoir",
            "cover": "/covers/when-breath-becomes-air.jpg",
            "year": 2016,
            "copies": 2,
        },
    ]

    for payload in invalid_payloads:
        response = client.post("/books", json=payload)
        assert response.status_code == 422
        body = response.json()
        assert "detail" in body
        assert isinstance(body["detail"], list)
        assert len(body["detail"]) > 0
        first_error = body["detail"][0]
        assert "loc" in first_error
        assert "msg" in first_error
        assert "type" in first_error


def test_post_books_duplicate_seed_isbn_returns_409_with_normalized_detail(client):
    payload = {
        "title": "Duplicate Odyssey",
        "author": "Another Author",
        "isbn": "978-0-1402-6886-7",
        "genre": "Epic",
        "cover": "/covers/duplicate.jpg",
        "year": 2001,
        "copies": 1,
    }

    response = client.post("/books", json=payload)

    assert response.status_code == 409
    assert response.json() == {"detail": "ISBN 9780140268867 already exists"}


def test_put_books_by_id_replaces_record_and_persists_changes(client):
    replacement = {
        "title": "Pride and Prejudice (Annotated)",
        "author": "Jane Austen",
        "isbn": "978-1-250-30571-1",
        "genre": "Classic",
        "cover": "/covers/pride-annotated.jpg",
        "year": 1813,
        "copies": 3,
    }

    updated = client.put("/books/2", json=replacement)

    assert updated.status_code == 200
    updated_body = updated.json()
    assert updated_body["id"] == "2"
    assert updated_body["title"] == replacement["title"]
    assert updated_body["author"] == replacement["author"]
    assert updated_body["isbn"] == "9781250305711"
    assert updated_body["genre"] == replacement["genre"]
    assert updated_body["cover"] == replacement["cover"]
    assert updated_body["year"] == replacement["year"]
    assert updated_body["copies"] == replacement["copies"]
    assert updated_body["available"] is True

    fetched = client.get("/books/2")
    assert fetched.status_code == 200
    fetched_body = fetched.json()
    assert fetched_body["id"] == "2"
    assert fetched_body["title"] == replacement["title"]
    assert fetched_body["author"] == replacement["author"]
    assert fetched_body["isbn"] == "9781250305711"
    assert fetched_body["genre"] == replacement["genre"]
    assert fetched_body["cover"] == replacement["cover"]
    assert fetched_body["year"] == replacement["year"]
    assert fetched_body["copies"] == replacement["copies"]
    assert fetched_body["available"] is True


def test_post_books_persists_to_file_for_fresh_store_instance(client):
    payload = {
        "title": "The Overstory",
        "author": "Richard Powers",
        "isbn": "978-0-393-63552-2",
        "genre": "Fiction",
        "cover": "/covers/the-overstory.jpg",
        "year": 2018,
        "copies": 1,
    }

    created = client.post("/books", json=payload)
    assert created.status_code == 201
    created_body = created.json()

    fresh_store = BookStore()
    stored = fresh_store.get(created_body["id"])

    assert stored is not None
    assert stored.id == created_body["id"]
    assert stored.isbn == "9780393635522"

    listed_ids = [book.id for book in fresh_store.list()]
    assert created_body["id"] in listed_ids
