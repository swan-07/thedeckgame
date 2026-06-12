from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    # New-style opaque secret key (sb_secret_...). Backend only, bypasses RLS.
    supabase_secret_key: str = ""
    # Optional: legacy HS256 shared secret, only for projects not yet migrated
    # to asymmetric JWT signing keys. Leave empty when using signing keys.
    supabase_jwt_secret: str = ""

    database_url: str = ""
    database_direct_url: str = ""

    admin_emails: str = ""
    resumes_bucket: str = "resumes"
    cors_origins: str = "http://localhost:5173"

    @property
    def jwks_url(self) -> str:
        return f"{self.supabase_url}/auth/v1/.well-known/jwks.json"

    @property
    def admin_email_set(self) -> set[str]:
        return {e.strip().lower() for e in self.admin_emails.split(",") if e.strip()}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
