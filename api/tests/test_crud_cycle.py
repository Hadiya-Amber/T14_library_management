from fastapi.testclient import TestClient
from api.app.main import app

client = TestClient(app)


def test_create_read_replace_delete_read_sequence_statuses_and_replace_effect(LIBRARY_DB_PATH):
    """AC-4: Create -> Read -> Replace -> Delete -> Read yields statuses 201,200,200,204,404 and replacement changes title."""

    # Create payload
    original = {
        "title": "Create Test Book",
        "author": "Test Author",
        "isbn": "9780000000007",
        "genre": "Test",
        "cover": "",
        "year": 2001,
        "copies": 1
    }

    post_resp = client.post("/books", json=original)
    assert post_resp.status_code == 201, "POST /books must return 201 on successful creation"
    created = post_resp.json()
    assert "id" in created and isinstance(created["id"], str), "Created book must include an 'id'"
    book_id = created["id"]

    # Read the created book
    get_resp = client.get(f"/books/{book_id}")
    assert get_resp.status_code == 200, "GET /books/{id} should return 200 after creation"
    fetched = get_resp.json()
    assert fetched.get("title") == original["title"], "Fetched book must match the created data"

    # Replace the book with a changed title
    replacement = original.copy()
    replacement["title"] = "Replaced Title"

    put_resp = client.put(f"/books/{book_id}", json=replacement)
    assert put_resp.status_code == 200, "PUT /books/{id} must return 200 when replacement succeeds"
    replaced = put_resp.json()
    assert replaced.get("title") == "Replaced Title", "PUT response should reflect the replaced title"

    # Verify that a GET now returns the replaced title
    get_after_replace = client.get(f"/books/{book_id}")
    assert get_after_replace.status_code == 200, "GET after replace should return 200"
    assert get_after_replace.json().get("title") == "Replaced Title", "GET after replace must return the updated title"

    # Delete the book
    del_resp = client.delete(f"/books/{book_id}")
    assert del_resp.status_code == 204, "DELETE /books/{id} must return 204 on successful deletion"

    # Final GET should return 404
    final_get = client.get(f"/books/{book_id}")
    assert final_get.status_code == 404, "GET after deletion should return 404"

    # Also assert the exact sequence of observed statuses matches the acceptance criterion
    observed = [post_resp.status_code, get_resp.status_code, put_resp.status_code, del_resp.status_code, final_get.status_code]
    assert observed == [201, 200, 200, 204, 404], f"Observed status sequence {observed} does not match expected [201,200,200,204,404]"
