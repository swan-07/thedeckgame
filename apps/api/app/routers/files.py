import re
import uuid

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.core.storage import create_signed_upload_url
from app.models import User
from app.schemas import SignedUpload, SignUploadRequest

router = APIRouter(prefix="/files", tags=["files"])

_SAFE = re.compile(r"[^A-Za-z0-9._-]")


def _safe_name(name: str) -> str:
    return _SAFE.sub("_", name)[-200:] or "file"


@router.post("/sign-upload", response_model=SignedUpload)
def sign_upload(
    payload: SignUploadRequest,
    user: User = Depends(get_current_user),
) -> SignedUpload:
    """Return a one-time signed URL for the browser to upload a file to.

    Files are namespaced under the user's id so a user can only write to their
    own prefix.
    """
    folder = "resume" if payload.purpose == "resume" else f"uploads/{_safe_name(payload.purpose)}"
    path = f"{user.id}/{folder}/{uuid.uuid4().hex}-{_safe_name(payload.filename)}"
    return SignedUpload(**create_signed_upload_url(path))
