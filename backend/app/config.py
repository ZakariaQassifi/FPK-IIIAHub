from functools import lru_cache
from urllib.parse import urlparse

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

#: Values that look like documentation placeholders rather than real
#: credentials. Using them produces confusing DNS errors at request time.
PLACEHOLDER_VALUES = {
    "",
    "your-project-ref",
    "your-project-ref.supabase.co",
    "your-project-id",
    "your-project-id.supabase.co",
    "your-supabase-url",
    "your-supabase-url.supabase.co",
    "your-supabase-anon-key",
    "your-supabase-service-role-key",
    "your-anon-key",
    "your-service-role-key",
    "your-service-key",
    "changeme",
    "change-me",
    "none",
    "null",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "FPK Academic Hub API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # SUPABASE_KEY is accepted as an alias so a deployment that only exposes
    # a single key variable still works.
    supabase_url: str = ""
    supabase_anon_key: str = Field(
        default="",
        validation_alias=AliasChoices("SUPABASE_ANON_KEY", "SUPABASE_KEY"),
    )
    supabase_service_role_key: str = Field(
        default="",
        validation_alias=AliasChoices(
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_SERVICE_KEY",
            "SUPABASE_KEY",
        ),
    )

    # JWT settings
    secret_key: str = "CHANGE_ME_IN_PRODUCTION"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Admin credentials (custom login, not Google OAuth)
    admin_username: str = ""
    admin_password_hash: str = ""

    # SMTP settings for email notifications
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "FPK Academic Hub <noreply@fpk.ac.ma>"
    smtp_use_tls: bool = True

    # ------------------------------------------------------------------
    # Supabase URL handling
    # ------------------------------------------------------------------

    @field_validator("supabase_url", mode="before")
    @classmethod
    def _normalise_supabase_url(cls, value: object) -> str:
        """Trim whitespace and trailing slashes from the Supabase URL."""
        if not isinstance(value, str):
            return ""
        return value.strip().rstrip("/")

    @field_validator(
        "supabase_anon_key",
        "supabase_service_role_key",
        mode="before",
    )
    @classmethod
    def _normalise_key(cls, value: object) -> str:
        if not isinstance(value, str):
            return ""
        return value.strip()

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.frontend_origins.split(",")
            if origin.strip()
        ]

    # ------------------------------------------------------------------
    # Supabase readiness
    # ------------------------------------------------------------------

    def _is_placeholder(self, value: str) -> bool:
        return value.strip().lower() in PLACEHOLDER_VALUES

    @property
    def supabase_url_is_placeholder(self) -> bool:
        return self._is_placeholder(self.supabase_url)

    @property
    def supabase_keys_are_placeholder(self) -> bool:
        return self._is_placeholder(
            self.supabase_anon_key
        ) or self._is_placeholder(self.supabase_service_role_key)

    def validate_supabase_url(self) -> str | None:
        """Return a human readable reason why the Supabase URL is unusable.

        ``None`` means the URL looks well formed.
        """
        url = self.supabase_url
        if not url:
            return (
                "SUPABASE_URL is not set. Add it to backend/.env, for example "
                "SUPABASE_URL=https://your-project-id.supabase.co"
            )

        if self.supabase_url_is_placeholder:
            return (
                "SUPABASE_URL still contains the placeholder "
                f"'{self.supabase_url}'. Replace it with the real project URL "
                "from Supabase > Project Settings > API."
            )

        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return (
                f"SUPABASE_URL '{url}' has no valid scheme. It must start with "
                "https:// (or http:// for a local instance)."
            )
        if not parsed.netloc:
            return (
                f"SUPABASE_URL '{url}' has no host. Expected something like "
                "https://your-project-id.supabase.co"
            )
        if " " in url:
            return f"SUPABASE_URL '{url}' contains spaces."
        return None

    def validate_supabase_keys(self) -> str | None:
        """Return a human readable reason why the Supabase keys are unusable."""
        if not self.supabase_anon_key:
            return (
                "SUPABASE_ANON_KEY is not set. Add it to backend/.env."
            )
        if not self.supabase_service_role_key:
            return (
                "SUPABASE_SERVICE_ROLE_KEY is not set. The backend needs it to "
                "bypass Row Level Security."
            )
        if self.supabase_keys_are_placeholder:
            return (
                "The Supabase keys still contain placeholder values. Replace "
                "them with the real keys from Supabase > Project Settings > API."
            )
        return None

    @property
    def supabase_configured(self) -> bool:
        return (
            self.validate_supabase_url() is None
            and self.validate_supabase_keys() is None
        )

    def supabase_problem(self) -> str | None:
        """Return the first configuration problem, if any."""
        return self.validate_supabase_url() or self.validate_supabase_keys()


@lru_cache
def get_settings() -> Settings:
    return Settings()
