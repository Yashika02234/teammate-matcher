import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

app = FastAPI(title="SyncUp — Teammate Matcher API")

# Read allowed origins from env var (comma-separated in production)
# Falls back to wildcard only for local development
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if _raw_origins == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)