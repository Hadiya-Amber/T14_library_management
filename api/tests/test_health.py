from fastapi.testclient import TestClient
import pytest

from api.app.main import app


@pytest.fixture
def isolated_db_path(tmp_path, monkeypatch):
    monkeypatch.setenv("LIBRARY_DB_PATH", str(tmp_path / "library.json"))


def test_get_health_returns_ok_payload(isolated_db_path):
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_preflight_allows_localhost_5173_origin(isolated_db_path):
    client = TestClient(app)

    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
