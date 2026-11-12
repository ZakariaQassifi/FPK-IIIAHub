from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel

from app.config import get_settings
from app.security import (
    authenticate_admin,
    create_access_token,
    get_admin_credentials,
    verify_token,
)

router = APIRouter(tags=["auth"])

API_V1_PREFIX = "/api/v1"

settings = get_settings()


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


def get_current_admin(authorization: str | None = Header(None)) -> dict:
    """Extract and verify JWT from Authorization header. Returns admin payload."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'authentification requis.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1]
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs.",
        )

    return payload


@router.post(
    f"{API_V1_PREFIX}/admin/login",
    response_model=AdminLoginResponse,
    summary="Admin login with custom credentials (username/password)",
)
async def admin_login(payload: AdminLoginRequest) -> dict:
    """Authenticate an administrator with username and password (bcrypt)."""
    credentials = get_admin_credentials()
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Administration non configurée sur le serveur.",
        )

    admin = authenticate_admin(payload.username, payload.password)
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiant ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=settings.access_token_expire_minutes
    )
    access_token = create_access_token(
        data={"sub": admin["username"], "role": admin["role"]},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": int(access_token_expires.total_seconds()),
    }


@router.get(
    f"{API_V1_PREFIX}/admin/me",
    summary="Get current admin user info",
)
async def admin_me(current_admin: dict = Depends(get_current_admin)) -> dict:
    """Return the currently authenticated admin user."""
    return current_admin


# Re-export for use in admin.py
__all__ = ["router", "get_current_admin"]
