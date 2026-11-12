import logging

from fastapi import HTTPException

from app.database import get_supabase, get_supabase_service

logger = logging.getLogger("app.routers")


def require_supabase():
    try:
        return get_supabase()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def require_service():
    try:
        return get_supabase_service()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def describe_db_error(exc: Exception) -> str:
    """Extract the precise message from a PostgREST / httpx / driver error.

    PostgREST errors expose ``message`` / ``details`` / ``hint``; transport
    errors only carry a string representation.
    """
    message = getattr(exc, "message", None)
    if isinstance(message, str) and message.strip():
        parts = [message.strip()]
        details = getattr(exc, "details", None)
        if isinstance(details, str) and details.strip():
            parts.append(f"({details.strip()})")
        hint = getattr(exc, "hint", None)
        if isinstance(hint, str) and hint.strip():
            parts.append(f"— {hint.strip()}")
        return " ".join(parts)

    text = str(exc).strip()
    return text or exc.__class__.__name__


def db_error(context: str, exc: Exception) -> HTTPException:
    """Log the original exception and build an HTTP error carrying the real cause."""
    logger.exception("%s: %s", context, describe_db_error(exc))
    return HTTPException(
        status_code=502, detail=f"{context}: {describe_db_error(exc)}"
    )


def build_storage_url(signed: str) -> str:
    """Turn a signed storage path into an absolute URL.

    Depending on the storage client version, ``create_signed_url`` returns
    either an absolute URL or a path relative to the storage API. Handle
    both so the link is never duplicated nor truncated.
    """
    if not signed:
        return ""
    if signed.startswith("http://") or signed.startswith("https://"):
        return signed

    from app.config import get_settings

    base = get_settings().supabase_url.rstrip("/")
    if signed.startswith("/"):
        return f"{base}/storage/v1{signed}"
    return f"{base}/storage/v1/{signed}"


def fetch(query) -> list[dict]:
    try:
        return query.execute().data or []
    except Exception as exc:
        raise db_error("Supabase query failed", exc) from exc


def get_single(client, table: str, column: str, value: str) -> dict | None:
    try:
        response = (
            client.table(table)
            .select("*")
            .eq(column, value)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        raise db_error(f"Unable to read {table}.{column}", exc) from exc
    rows = response.data or []
    return rows[0] if rows else None
