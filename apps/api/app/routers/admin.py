import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.db import get_db
from app.core.security import require_admin
from app.core.storage import create_signed_download_url
from app.models import Application, Game, GameStatus, User
from app.schemas import (
    ApplicationReview,
    DecisionUpdate,
    GameCreate,
    GameDetail,
    GameSummary,
    GameUpdate,
)
from app.schemas.file import FileRef
from app.services.questions import SchemaError, validate_question_schema

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def _validate_schema(raw_schema) -> list[dict]:
    try:
        return validate_question_schema([q.model_dump(exclude_none=True) for q in raw_schema])
    except SchemaError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


# ── Games ────────────────────────────────────────────────────────────────

@router.post("/games", response_model=GameDetail, status_code=201)
def create_game(
    payload: GameCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Game:
    clean_schema = _validate_schema(payload.question_schema)
    clash = db.scalar(
        select(Game).where(Game.suit == payload.suit, Game.rank == payload.rank)
    )
    if clash is not None:
        raise HTTPException(status_code=409, detail="A game already exists for that card")

    game = Game(
        suit=payload.suit,
        rank=payload.rank,
        title=payload.title,
        description=payload.description,
        question_schema=clean_schema,
        opens_at=payload.opens_at,
        closes_at=payload.closes_at,
        created_by=admin.id,
    )
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


def _game_summaries(db: Session, *, deleted: bool) -> list[GameSummary]:
    count = func.count(Application.id)
    where = Game.deleted_at.is_not(None) if deleted else Game.deleted_at.is_(None)
    order = Game.deleted_at.desc() if deleted else Game.created_at.desc()
    stmt = (
        select(Game, count)
        .outerjoin(Application, Application.game_id == Game.id)
        .where(where)
        .group_by(Game.id)
        .order_by(order)
    )
    out: list[GameSummary] = []
    for game, n in db.execute(stmt).all():
        summary = GameSummary.model_validate(game)
        summary.application_count = n
        out.append(summary)
    return out


@router.get("/games", response_model=list[GameSummary])
def list_games(db: Session = Depends(get_db)) -> list[GameSummary]:
    """Active (non-deleted) games."""
    return _game_summaries(db, deleted=False)


# Must be declared before "/games/{game_id}" so "deleted" isn't parsed as an id.
@router.get("/games/deleted", response_model=list[GameSummary])
def list_deleted_games(db: Session = Depends(get_db)) -> list[GameSummary]:
    """Soft-deleted games — admin-only, never exposed to applicants."""
    return _game_summaries(db, deleted=True)


@router.get("/games/{game_id}", response_model=GameDetail)
def get_game(game_id: uuid.UUID, db: Session = Depends(get_db)) -> Game:
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.patch("/games/{game_id}", response_model=GameDetail)
def update_game(
    game_id: uuid.UUID,
    payload: GameUpdate,
    db: Session = Depends(get_db),
) -> Game:
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    data = payload.model_dump(exclude_unset=True)

    # Structural fields are locked once a game leaves draft, to protect any
    # applications that may already reference the question schema / card.
    locked = {"question_schema", "suit", "rank"}
    if game.status != GameStatus.draft and locked & data.keys():
        raise HTTPException(
            status_code=400,
            detail="Cannot change questions or card of a published game",
        )

    if "question_schema" in data:
        game.question_schema = _validate_schema(payload.question_schema)
        data.pop("question_schema")

    if {"suit", "rank"} & data.keys():
        suit = data.get("suit", game.suit)
        rank = data.get("rank", game.rank)
        clash = db.scalar(
            select(Game).where(Game.suit == suit, Game.rank == rank, Game.id != game.id)
        )
        if clash is not None:
            raise HTTPException(status_code=409, detail="A game already exists for that card")

    for key, value in data.items():
        setattr(game, key, value)

    db.commit()
    db.refresh(game)
    return game


@router.post("/games/{game_id}/publish", response_model=GameDetail)
def publish_game(game_id: uuid.UUID, db: Session = Depends(get_db)) -> Game:
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status == GameStatus.published:
        return game
    game.status = GameStatus.published
    if game.opens_at is None:
        game.opens_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(game)
    return game


@router.post("/games/{game_id}/close", response_model=GameDetail)
def close_game(game_id: uuid.UUID, db: Session = Depends(get_db)) -> Game:
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    game.status = GameStatus.closed
    db.commit()
    db.refresh(game)
    return game


@router.post("/games/{game_id}/reopen", response_model=GameDetail)
def reopen_game(game_id: uuid.UUID, db: Session = Depends(get_db)) -> Game:
    """Reopen a closed game back to published."""
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    game.status = GameStatus.published
    # If it had a close date that's already passed, clear it so the reopen is
    # actually effective (otherwise the date gate would still reject applicants).
    now = datetime.now(timezone.utc)
    if game.closes_at and game.closes_at < now:
        game.closes_at = None
    if game.opens_at is None:
        game.opens_at = now
    db.commit()
    db.refresh(game)
    return game


@router.delete("/games/{game_id}", response_model=GameDetail)
def delete_game(game_id: uuid.UUID, db: Session = Depends(get_db)) -> Game:
    """Soft delete: archive the game. Hidden from applicants, recoverable."""
    game = db.get(Game, game_id)
    if game is None or game.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Game not found")
    game.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(game)
    return game


@router.post("/games/{game_id}/restore", response_model=GameDetail)
def restore_game(game_id: uuid.UUID, db: Session = Depends(get_db)) -> Game:
    """Recover a soft-deleted game, returning it to its prior status."""
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    game.deleted_at = None
    db.commit()
    db.refresh(game)
    return game


# ── Review ───────────────────────────────────────────────────────────────

@router.get("/games/{game_id}/applications", response_model=list[ApplicationReview])
def list_applications(game_id: uuid.UUID, db: Session = Depends(get_db)) -> list[ApplicationReview]:
    if db.get(Game, game_id) is None:
        raise HTTPException(status_code=404, detail="Game not found")
    stmt = (
        select(Application)
        .where(Application.game_id == game_id)
        .options(selectinload(Application.user), selectinload(Application.files))
        .order_by(Application.submitted_at.asc())
    )
    out: list[ApplicationReview] = []
    for app in db.scalars(stmt).all():
        review = ApplicationReview(
            id=app.id,
            user_id=app.user_id,
            applicant_name=app.user.full_name,
            applicant_email=app.user.email,
            answers=app.answers,
            profile_snapshot=app.profile_snapshot,
            status=app.status,
            submitted_at=app.submitted_at,
            decided_at=app.decided_at,
            files=[
                FileRef(
                    id=f.id,
                    question_id=f.question_id,
                    filename=f.filename,
                    content_type=f.content_type,
                    size=f.size,
                    download_url=create_signed_download_url(f.storage_path),
                )
                for f in app.files
            ],
        )
        out.append(review)
    return out


@router.patch("/applications/{application_id}/decision", response_model=ApplicationReview)
def set_decision(
    application_id: uuid.UUID,
    payload: DecisionUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ApplicationReview:
    app = db.get(Application, application_id)
    if app is None:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = payload.status
    app.decided_at = datetime.now(timezone.utc)
    app.decided_by = admin.id
    db.commit()
    db.refresh(app)

    return ApplicationReview(
        id=app.id,
        user_id=app.user_id,
        applicant_name=app.user.full_name,
        applicant_email=app.user.email,
        answers=app.answers,
        profile_snapshot=app.profile_snapshot,
        status=app.status,
        submitted_at=app.submitted_at,
        decided_at=app.decided_at,
        files=[
            FileRef(
                id=f.id,
                question_id=f.question_id,
                filename=f.filename,
                content_type=f.content_type,
                size=f.size,
                download_url=create_signed_download_url(f.storage_path),
            )
            for f in app.files
        ],
    )
