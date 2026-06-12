import httpx

from app.core.config import settings

_BASE = f"{settings.supabase_url}/storage/v1"
_HEADERS = {
    "Authorization": f"Bearer {settings.supabase_secret_key}",
    "apikey": settings.supabase_secret_key,
}


def create_signed_upload_url(path: str) -> dict:
    """Return a one-time signed URL the browser can PUT a file to.

    Response: { "path": ..., "token": ..., "signed_url": <absolute> }
    """
    bucket = settings.resumes_bucket
    resp = httpx.post(
        f"{_BASE}/object/upload/sign/{bucket}/{path}",
        headers=_HEADERS,
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    token = data["token"]
    return {
        "path": path,
        "token": token,
        "signed_url": f"{_BASE}/object/upload/sign/{bucket}/{path}?token={token}",
    }


def create_signed_download_url(path: str, expires_in: int = 3600) -> str:
    bucket = settings.resumes_bucket
    resp = httpx.post(
        f"{_BASE}/object/sign/{bucket}/{path}",
        headers=_HEADERS,
        json={"expiresIn": expires_in},
        timeout=15,
    )
    resp.raise_for_status()
    signed = resp.json()["signedURL"]
    return f"{_BASE}{signed}" if signed.startswith("/") else signed


def delete_object(path: str) -> None:
    bucket = settings.resumes_bucket
    httpx.request(
        "DELETE",
        f"{_BASE}/object/{bucket}/{path}",
        headers=_HEADERS,
        timeout=15,
    )
