"""Vercel serverless entrypoint for the FastAPI backend.

Vercel's Python runtime looks for an ASGI ``app`` object in each ``.py``
file under ``api/``. This adapter mounts the FastAPI application defined
in ``backend/app/main.py`` so every request handled by this function is
served by the real backend.

Backend routes are already prefixed with ``/api`` (e.g. ``/api/v1/...``),
and ``vercel.json`` rewrites ``/api/(.*)`` to this function, so the
original request path is preserved and no route collision with the React
SPA is possible.
"""

import os
import sys

API_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(API_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

# Make `backend/app` importable as the `app` package regardless of how
# Vercel resolves the working directory for the serverless function.
for _path in (ROOT_DIR, BACKEND_DIR):
    if _path not in sys.path:
        sys.path.insert(0, _path)

# Ensure Vercel's injected environment variables (SUPABASE_URL, ...) are
# picked up by pydantic-settings even without a .env file in production.
os.environ.setdefault("ENVIRONMENT", "production")

from app.main import app  # noqa: E402

__all__ = ["app"]
