"""Shared pytest configuration for API tests.

Provides a `LIBRARY_DB_PATH` fixture that points the application at a
temporary JSON file for each test, ensuring isolation between test runs.
"""

from __future__ import annotations

import os

import pytest


@pytest.fixture
def LIBRARY_DB_PATH(tmp_path: "pathlib.Path") -> str:
    """Return a filesystem path for the library DB and export it via env var.

    The BookStore will initialize the file with seed data if it does not
    already exist, so tests get a fresh seeded store per run.
    """

    db_path = tmp_path / "books.json"
    # Ensure parent directory exists and expose path to the app via env var
    os.environ["LIBRARY_DB_PATH"] = str(db_path)
    return str(db_path)
