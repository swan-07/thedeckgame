from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import admin, applications, files, games, me

app = FastAPI(title="The Deck Game API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(me.router)
app.include_router(games.router)
app.include_router(applications.router)
app.include_router(files.router)
app.include_router(admin.router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}
