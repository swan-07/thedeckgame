import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models import ApplicationStatus
from app.schemas.file import FileRef, FileRegister


class SubmitApplication(BaseModel):
    game_id: uuid.UUID
    answers: dict = {}
    # Files already uploaded to storage for file-type questions.
    files: list[FileRegister] = []


class ApplicationDetail(BaseModel):
    """Applicant's own view of a submitted application (read-only)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    game_id: uuid.UUID
    answers: dict
    profile_snapshot: dict
    status: ApplicationStatus
    submitted_at: datetime
    decided_at: datetime | None
    files: list[FileRef] = []


class ApplicationSummary(BaseModel):
    """Row in the applicant's 'my applications' list."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    game_id: uuid.UUID
    game_title: str
    game_suit: str
    game_rank: int
    status: ApplicationStatus
    submitted_at: datetime
    decided_at: datetime | None


class ApplicationReview(BaseModel):
    """Admin's view of an application while reviewing a game."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    applicant_name: str | None
    applicant_email: str
    answers: dict
    profile_snapshot: dict
    status: ApplicationStatus
    submitted_at: datetime
    decided_at: datetime | None
    files: list[FileRef] = []


class DecisionUpdate(BaseModel):
    status: ApplicationStatus
