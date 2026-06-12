from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas import ProfileUpdate, UserMe

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=UserMe)
def read_me(user: User = Depends(get_current_user)) -> User:
    return user


@router.put("/profile", response_model=UserMe)
def update_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    data = payload.model_dump(exclude_unset=True)
    full_name = data.pop("full_name", None)
    if full_name is not None:
        user.full_name = full_name
    # Merge into the existing profile JSON so partial updates don't wipe fields.
    merged = dict(user.profile or {})
    merged.update(data)
    user.profile = merged
    db.commit()
    db.refresh(user)
    return user
