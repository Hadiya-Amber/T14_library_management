from fastapi.testclient import TestClient
from api.app.main import app

client = TestClient(app)


def test_openapi_contains_expected_paths_and_post_responses(LIBRARY_DB_PATH):
    """AC-3: /openapi.json lists /health, /books and /books/{book_id}; POST /books documents 201,409,422."""

    resp = client.get("/openapi.json")
    assert resp.status_code == 200, "GET /openapi.json should succeed"

    spec = resp.json()

    # Ensure expected top-level paths are present
    paths = spec.get("paths", {})
    assert "/health" in paths, "/health must be documented in the OpenAPI paths"
    assert "/books" in paths, "/books must be documented in the OpenAPI paths"
    assert "/books/{book_id}" in paths or "/books/{book_id}".replace("{book_id}", "{book_id}") in paths, "/books/{book_id} must be documented in the OpenAPI paths"

    # Inspect POST /books responses for required status codes
    post_op = paths.get("/books", {}).get("post")
    assert isinstance(post_op, dict), "POST /books operation must be present in the OpenAPI spec"
    responses = post_op.get("responses", {})

    # The documented responses should include 201, 409 and 422
    for expected in ("201", "409", "422"):
        assert expected in responses, f"POST /books must document a {expected} response"


def test_readme_contains_run_it_and_endpoints():
    """AC-3 (README): The api/README.md contains a 'Run it' uvicorn command and an 'Endpoints' section."""

    try:
        with open("api/README.md", "r", encoding="utf-8") as fh:
            content = fh.read()
    except FileNotFoundError:
        content = ""

    assert "Run it" in content or "run it" in content or "uvicorn" in content, "README should include a 'Run it' instruction or a uvicorn command"
    assert "Endpoints" in content or "endpoints" in content, "README should document an 'Endpoints' section"
