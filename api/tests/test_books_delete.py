from fastapi.testclient import TestClient
from api.app.main import app

client = TestClient(app)


def test_delete_book_persists_removal(LIBRARY_DB_PATH):
    """AC-1: Deleting an existing book id yields 204, subsequent GET 404, and list omits it.

    The test accepts the LIBRARY_DB_PATH fixture so the test runs with an isolated store.
    """

    # Attempt to delete the book with id "2" as the acceptance criteria specifies.
    resp = client.delete("/books/2")
    # Deletion should return HTTP 204 No Content with an empty body
    assert resp.status_code == 204, "DELETE /books/2 should return 204 when the book exists"
    assert resp.content in (b"", b"null"), "DELETE /books/2 should return an empty body"

    # A subsequent GET for the same id must return 404
    get_resp = client.get("/books/2")
    assert get_resp.status_code == 404, "GET /books/2 should return 404 after deletion"
    # Ensure the error detail mentions the missing resource id in a human-readable form
    detail = None
    try:
        detail = get_resp.json().get("detail")
    except ValueError:
        detail = None
    assert detail is not None and "2" in str(detail), "404 response should include the missing book id in detail"

    # Listing all books must not include any book with id '2'
    list_resp = client.get("/books")
    assert list_resp.status_code == 200, "GET /books should succeed"
    books = list_resp.json()
    assert all(book.get("id") != "2" for book in books), "No book in the list should have id '2' after deletion"


def test_delete_unknown_returns_404(LIBRARY_DB_PATH):
    """AC-2: Deleting a non-existent book id returns 404 with an explanatory detail."""

    missing_id = "missing-12345"
    resp = client.delete(f"/books/{missing_id}")

    # When the resource is missing, the API should return a 404 status code
    assert resp.status_code == 404, f"DELETE /books/{missing_id} should return 404 for unknown id"

    # The body should be JSON with a 'detail' message referencing the missing id
    json_body = None
    try:
        json_body = resp.json()
    except ValueError:
        json_body = None
    assert isinstance(json_body, dict) and "detail" in json_body, "404 response must include a 'detail' field"
    assert missing_id in str(json_body.get("detail")), "The detail message should mention the missing book id"
