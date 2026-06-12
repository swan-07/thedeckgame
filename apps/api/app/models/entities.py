import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    applicant = "applicant"


class GameStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    closed = "closed"


class ApplicationStatus(str, enum.Enum):
    submitted = "submitted"
    accepted = "accepted"
    denied = "denied"
    waitlisted = "waitlisted"


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


def _now() -> datetime:
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    # Matches the Supabase auth user id (sub claim).
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(200))
    avatar_url: Mapped[str | None] = mapped_column(String(1024))
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), default=UserRole.applicant, nullable=False
    )
    # Global, editable profile fields (school, grad_year, major, phone,
    # linkedin_url, github_url, website_url, short_bio, resume_path, ...).
    profile: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Application has two FKs to users (user_id, decided_by) so the join column
    # must be named explicitly.
    applications: Mapped[list["Application"]] = relationship(
        back_populates="user", foreign_keys="Application.user_id"
    )


class Game(Base):
    __tablename__ = "games"
    __table_args__ = (
        UniqueConstraint("suit", "rank", name="uq_game_suit_rank"),
        CheckConstraint("rank >= 1 AND rank <= 13", name="ck_game_rank_range"),
        CheckConstraint("suit IN ('S','C','D','H')", name="ck_game_suit"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    suit: Mapped[str] = mapped_column(String(1), nullable=False)  # S C D H
    rank: Mapped[int] = mapped_column(nullable=False)  # 1..13 (1=Ace, 11=J, 12=Q, 13=K)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String, default="", nullable=False)
    status: Mapped[GameStatus] = mapped_column(
        Enum(GameStatus, name="game_status"), default=GameStatus.draft, nullable=False
    )
    # Ordered list of question definitions produced by the admin builder.
    question_schema: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    opens_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    closes_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Soft delete: non-null means archived. Hidden from applicants, recoverable
    # by admins. The game keeps its status so restore returns it as it was.
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    applications: Mapped[list["Application"]] = relationship(back_populates="game")


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("user_id", "game_id", name="uq_application_user_game"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    game_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("games.id"), nullable=False
    )
    # Answers keyed by question id. Immutable once submitted.
    answers: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    # Frozen copy of the user's profile at submit time.
    profile_snapshot: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.submitted,
        nullable=False,
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    decided_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )

    user: Mapped["User"] = relationship(back_populates="applications", foreign_keys=[user_id])
    game: Mapped["Game"] = relationship(back_populates="applications")
    files: Mapped[list["ApplicationFile"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )


class ApplicationFile(Base):
    __tablename__ = "application_files"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False
    )
    # The question this file answers (null for the snapshotted resume).
    question_id: Mapped[str | None] = mapped_column(String(64))
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    content_type: Mapped[str | None] = mapped_column(String(255))
    size: Mapped[int | None] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    application: Mapped["Application"] = relationship(back_populates="files")
