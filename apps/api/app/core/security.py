import uuid
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models import User, UserRole

bearer = HTTPBearer(auto_error=True)

# Supabase signs access tokens with asymmetric signing keys (ES256/RS256); the
# public keys are published at the project's JWKS endpoint. Older projects may
# still sign with a legacy HS256 shared secret — supported as a fallback.
ASYMMETRIC_ALGS = ["ES256", "RS256"]
AUDIENCE = "authenticated"


@lru_cache
def _jwks_client() -> PyJWKClient:
    # PyJWKClient fetches and caches the signing keys, selecting by `kid`.
    return PyJWKClient(settings.jwks_url)


def _decode_token(token: str) -> dict:
    try:
        alg = jwt.get_unverified_header(token).get("alg")
        if alg == "HS256":
            if not settings.supabase_jwt_secret:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="HS256 token but no legacy JWT secret configured",
                )
            key = settings.supabase_jwt_secret
            algorithms = ["HS256"]
        else:
            key = _jwks_client().get_signing_key_from_jwt(token).key
            algorithms = ASYMMETRIC_ALGS

        return jwt.decode(token, key, algorithms=algorithms, audience=AUDIENCE)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    """Verify the Supabase JWT and return the matching local user.

    On first contact a local `users` row is created. Role is assigned from the
    admin email allowlist; the email is trusted because it comes from a
    signature-verified Supabase token.
    """
    claims = _decode_token(creds.credentials)
    sub = claims.get("sub")
    email = (claims.get("email") or "").lower()
    if not sub or not email:
        raise HTTPException(status_code=401, detail="Token missing subject or email")

    user_id = uuid.UUID(sub)
    user = db.get(User, user_id)
    metadata = claims.get("user_metadata") or {}
    desired_role = UserRole.admin if email in settings.admin_email_set else UserRole.applicant

    if user is None:
        user = User(
            id=user_id,
            email=email,
            full_name=metadata.get("full_name") or metadata.get("name"),
            avatar_url=metadata.get("avatar_url") or metadata.get("picture"),
            role=desired_role,
            profile={},
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.role != desired_role:
        # Keep role in sync if the allowlist changes.
        user.role = desired_role
        db.commit()
        db.refresh(user)

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
