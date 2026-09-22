Run it

From the repository root, run the API with uvicorn (the tests use the app object
directly and do not require this):

    cd api && ../.venv/bin/uvicorn app.main:app --reload

Endpoints

The API exposes the following HTTP operations:

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| GET | /health | Service health | 200 |
| GET | /books | List books | 200 |
| POST | /books | Create a book | 201 |
| GET | /books/{book_id} | Get a book by id | 200 |
| PUT | /books/{book_id} | Replace a book | 200 |
| DELETE | /books/{book_id} | Delete a book | 204 |
