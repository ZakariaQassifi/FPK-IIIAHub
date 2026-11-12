import logging
from functools import lru_cache

from supabase import Client, create_client

from app.config import get_settings

logger = logging.getLogger("app.database")


def _configuration_error(problem: str) -> RuntimeError:
    return RuntimeError(
        f"{problem} (see backend/.env). The API cannot reach the database "
        "until this is fixed."
    )


@lru_cache
def get_supabase() -> Client:
    """Return a cached Supabase client using the anon key.

    Auth-scoped requests should be created per-request with the user's access
    token. The service-role key must never be exposed to the frontend or used
    for regular API queries.
    """
    settings = get_settings()

    problem = settings.validate_supabase_url()
    if problem:
        raise _configuration_error(problem)

    if not settings.supabase_anon_key:
        raise _configuration_error(
            "SUPABASE_ANON_KEY is not set. Add it to backend/.env."
        )

    return create_client(settings.supabase_url, settings.supabase_anon_key)


@lru_cache
def get_supabase_service() -> Client:
    """Return a cached Supabase client using the service-role key.

    This client bypasses Row Level Security. It must only be used on the
    server for trusted server-side operations (storage uploads, validated
    submissions), never in code reachable by the browser.
    """
    settings = get_settings()

    problem = settings.validate_supabase_url()
    if problem:
        raise _configuration_error(problem)

    if not settings.supabase_service_role_key:
        raise _configuration_error(
            "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to backend/.env."
        )

    return create_client(
        settings.supabase_url, settings.supabase_service_role_key
    )


@lru_cache
def check_supabase_connectivity() -> tuple[bool, str]:
    """Probe the configured Supabase instance.

    Returns ``(ok, message)``. Used by the startup self-check and by the
    ``/health/detailed`` endpoint so a misconfiguration is reported
    explicitly instead of surfacing as a DNS error on the first query.
    """
    settings = get_settings()

    problem = settings.supabase_problem()
    if problem:
        return False, problem

    try:
        client = get_supabase_service()
        client.table("roles").select("id").limit(1).execute()
    except Exception as exc:
        message = str(exc).strip() or exc.__class__.__name__
        return False, f"Cannot reach {settings.supabase_url}: {message}"

    return True, f"Connected to {settings.supabase_url}"
