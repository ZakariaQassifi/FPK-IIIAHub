import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import check_supabase_connectivity
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.catalog import router as catalog_router
from app.routers.contributions import router as contributions_router
from app.routers.submissions import router as submissions_router

logger = logging.getLogger("app")
settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    ok, message = check_supabase_connectivity()
    if ok:
        logger.info("Supabase: %s", message)
    else:
        logger.error(
            "Supabase is not ready: %s "
            "Endpoints touching the database will return 503 until this is fixed.",
            message,
        )
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend API for the FPK Academic Hub platform.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions_router)
app.include_router(contributions_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(catalog_router)


@app.get("/", tags=["meta"])
async def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}


@app.get("/health/detailed", tags=["meta"])
async def health_detailed() -> dict:
    """Report the database connectivity and the current configuration."""
    ok, message = check_supabase_connectivity()
    return {
        "status": "ok" if ok else "degraded",
        "environment": settings.environment,
        "supabase": {
            "configured": settings.supabase_configured,
            "url": settings.supabase_url or None,
            "reachable": ok,
            "message": message,
        },
    }


@app.get(f"{settings.api_v1_prefix}/ping", tags=["meta"])
async def ping() -> dict[str, str]:
    return {"message": "pong"}
