import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models import GameStatus

Suit = Literal["S", "C", "D", "H"]
QuestionType = Literal[
    "short_text", "long_text", "single_choice", "multi_choice", "file", "number", "date", "url"
]


class Question(BaseModel):
    id: str
    type: QuestionType
    label: str
    required: bool = False
    options: list[str] | None = None
    maxLength: int | None = None


class GameBase(BaseModel):
    suit: Suit
    rank: int = Field(ge=1, le=13)
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    question_schema: list[Question] = []
    opens_at: datetime | None = None
    closes_at: datetime | None = None


class GameCreate(GameBase):
    pass


class GameUpdate(BaseModel):
    suit: Suit | None = None
    rank: int | None = Field(default=None, ge=1, le=13)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    question_schema: list[Question] | None = None
    opens_at: datetime | None = None
    closes_at: datetime | None = None


class GameSummary(BaseModel):
    """Admin-facing list row."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    suit: str
    rank: int
    title: str
    status: GameStatus
    opens_at: datetime | None
    closes_at: datetime | None
    application_count: int = 0


class GameDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    suit: str
    rank: int
    title: str
    description: str
    status: GameStatus
    question_schema: list
    opens_at: datetime | None
    closes_at: datetime | None
    created_at: datetime
    updated_at: datetime


class GamePublic(BaseModel):
    """Applicant-facing view (only published/closed games)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    suit: str
    rank: int
    title: str
    description: str
    status: GameStatus
    question_schema: list
    opens_at: datetime | None
    closes_at: datetime | None
