from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt

from app.config import get_settings

settings = get_settings()


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def verify_token(token: str) -> dict[str, Any] | None:
    """Verify and decode a JWT access token."""
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        return payload
    except jwt.PyJWTError:
        return None


def get_admin_credentials() -> dict[str, str] | None:
    """Return admin credentials from environment variables."""
    username = settings.admin_username
    password_hash = settings.admin_password_hash
    if not username or not password_hash:
        return None
    return {"username": username, "password_hash": password_hash}


def authenticate_admin(username: str, password: str) -> dict[str, Any] | None:
    """Authenticate an admin user with username and password."""
    credentials = get_admin_credentials()
    if credentials is None:
        return None
    if username != credentials["username"]:
        return None
    if not verify_password(password, credentials["password_hash"]):
        return None
    return {
        "username": username,
        "role": "ADMIN",
        "sub": username,
    }
