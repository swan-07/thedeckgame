import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.models import UserRole


class ProfileFields(BaseModel):
    """The fixed set of global profile fields."""

    school: str | None = None
    grad_year: int | None = None
    major: str | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    website_url: str | None = None
    short_bio: str | None = Field(default=None, max_length=2000)
    # Path of the resume in the storage bucket (set via the upload flow).
    resume_path: str | None = None
    resume_filename: str | None = None


class ProfileUpdate(ProfileFields):
    full_name: str | None = None


class UserMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str | None
    avatar_url: str | None
    role: UserRole
    profile: dict
