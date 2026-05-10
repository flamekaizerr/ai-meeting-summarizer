from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from config import settings
from database import init_db
from routers import meetings, uploads


app = FastAPI(title="AI Meeting Summarizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(uploads.router, prefix="/api", tags=["uploads"])
app.include_router(meetings.router, prefix="/api", tags=["meetings"])


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "AI Meeting Summarizer API"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
