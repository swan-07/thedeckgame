"""add soft-delete to games

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-12
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "games",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_games_deleted_at", "games", ["deleted_at"])


def downgrade() -> None:
    op.drop_index("ix_games_deleted_at", table_name="games")
    op.drop_column("games", "deleted_at")
