import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import Game, GameStatus
from app.schemas import GamePublic

# Published/closed games are public marketing data, so the deck renders for
# logged-out visitors. Applying still requires auth on the applications router.
router = APIRouter(prefix="/games", tags=["games"])

VISIBLE = (GameStatus.published, GameStatus.closed)


@router.get("", response_model=list[GamePublic])
def list_games(db: Session = Depends(get_db)) -> list[Game]:
    """All games visible to applicants (published or closed), for the deck grid."""
    stmt = (
        select(Game)
        .where(Game.status.in_(VISIBLE), Game.deleted_at.is_(None))
        .order_by(Game.suit, Game.rank)
    )
    return list(db.scalars(stmt).all())


@router.get("/{game_id}", response_model=GamePublic)
def get_game(
    game_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Game:
    game = db.get(Game, game_id)
    if game is None or game.status not in VISIBLE or game.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game
