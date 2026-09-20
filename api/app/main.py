"""FastAPI application entrypoint for the library backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.app.routers.books import router as books_router

app = FastAPI(title="Library API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books_router)


@app.get("/health")
def get_health() -> dict[str, str]:
    """Return service health status.

    Returns:
        Constant health payload indicating the API is alive.
    """

    return {"status": "ok"}
