"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-11
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# create_type=False so create_table() does not also emit CREATE TYPE for these
# columns — the enums are created/dropped explicitly in upgrade()/downgrade().
user_role = postgresql.ENUM("admin", "applicant", name="user_role", create_type=False)
game_status = postgresql.ENUM(
    "draft", "published", "closed", name="game_status", create_type=False
)
application_status = postgresql.ENUM(
    "submitted",
    "accepted",
    "denied",
    "waitlisted",
    name="application_status",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)
    game_status.create(bind, checkfirst=True)
    application_status.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("full_name", sa.String(200)),
        sa.Column("avatar_url", sa.String(1024)),
        sa.Column("role", user_role, nullable=False, server_default="applicant"),
        sa.Column(
            "profile",
            postgresql.JSONB,
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "games",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("suit", sa.String(1), nullable=False),
        sa.Column("rank", sa.Integer, nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.String, nullable=False, server_default=""),
        sa.Column("status", game_status, nullable=False, server_default="draft"),
        sa.Column(
            "question_schema",
            postgresql.JSONB,
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("opens_at", sa.DateTime(timezone=True)),
        sa.Column("closes_at", sa.DateTime(timezone=True)),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint("suit", "rank", name="uq_game_suit_rank"),
        sa.CheckConstraint("rank >= 1 AND rank <= 13", name="ck_game_rank_range"),
        sa.CheckConstraint("suit IN ('S','C','D','H')", name="ck_game_suit"),
    )

    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "game_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("games.id"),
            nullable=False,
        ),
        sa.Column(
            "answers", postgresql.JSONB, nullable=False, server_default=sa.text("'{}'::jsonb")
        ),
        sa.Column(
            "profile_snapshot",
            postgresql.JSONB,
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "status", application_status, nullable=False, server_default="submitted"
        ),
        sa.Column(
            "submitted_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("decided_at", sa.DateTime(timezone=True)),
        sa.Column("decided_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.UniqueConstraint("user_id", "game_id", name="uq_application_user_game"),
    )

    op.create_table(
        "application_files",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("applications.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("question_id", sa.String(64)),
        sa.Column("storage_path", sa.String(1024), nullable=False),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("content_type", sa.String(255)),
        sa.Column("size", sa.Integer),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(
        "ix_application_files_application_id", "application_files", ["application_id"]
    )


def downgrade() -> None:
    op.drop_table("application_files")
    op.drop_table("applications")
    op.drop_table("games")
    op.drop_table("users")
    bind = op.get_bind()
    application_status.drop(bind, checkfirst=True)
    game_status.drop(bind, checkfirst=True)
    user_role.drop(bind, checkfirst=True)
