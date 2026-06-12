import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.db import get_db
from app.core.security import get_current_user
from app.core.storage import create_signed_download_url
from app.models import Application, ApplicationFile, Game, GameStatus, User
from app.schemas import ApplicationDetail, ApplicationSummary, SubmitApplication
from app.schemas.file import FileRef
from app.services.questions import AnswerError, validate_answers

router = APIRouter(prefix="/applications", tags=["applications"])

PROFILE_SNAPSHOT_FIELDS = [
    "school", "grad_year", "major", "phone",
    "linkedin_url", "github_url", "website_url", "short_bio",
]


def _file_refs(files: list[ApplicationFile]) -> list[FileRef]:
    out: list[FileRef] = []
    for f in files:
        ref = FileRef.model_validate(f)
        ref.download_url = create_signed_download_url(f.storage_path)
        out.append(ref)
    return out


def _detail(app: Application) -> ApplicationDetail:
    detail = ApplicationDetail.model_validate(app)
    detail.files = _file_refs(app.files)
    return detail


@router.post("", response_model=ApplicationDetail, status_code=201)
def submit_application(
    payload: SubmitApplication,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    game = db.get(Game, payload.game_id)
    if game is None or game.status != GameStatus.published or game.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Game not open for applications")

    now = datetime.now(timezone.utc)
    if game.opens_at and now < game.opens_at:
        raise HTTPException(status_code=400, detail="Applications have not opened yet")
    if game.closes_at and now > game.closes_at:
        raise HTTPException(status_code=400, detail="Applications have closed")

    existing = db.scalar(
        select(Application).where(
            Application.user_id == user.id, Application.game_id == game.id
        )
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="You have already applied to this game")

    uploaded_qids = {f.question_id for f in payload.files if f.question_id}
    try:
        clean_answers = validate_answers(game.question_schema, payload.answers, uploaded_qids)
    except AnswerError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    profile = user.profile or {}
    snapshot = {
        "full_name": user.full_name,
        "email": user.email,
        **{k: profile.get(k) for k in PROFILE_SNAPSHOT_FIELDS},
    }

    app = Application(
        user_id=user.id,
        game_id=game.id,
        answers=clean_answers,
        profile_snapshot=snapshot,
    )
    db.add(app)
    db.flush()  # assign app.id for the file rows

    # Per-question uploaded files.
    for f in payload.files:
        db.add(
            ApplicationFile(
                application_id=app.id,
                question_id=f.question_id,
                storage_path=f.storage_path,
                filename=f.filename,
                content_type=f.content_type,
                size=f.size,
            )
        )
    # Snapshot the profile resume, if one is set.
    if profile.get("resume_path"):
        db.add(
            ApplicationFile(
                application_id=app.id,
                question_id=None,
                storage_path=profile["resume_path"],
                filename=profile.get("resume_filename") or "resume",
            )
        )

    db.commit()
    db.refresh(app)
    return _detail(app)


@router.get("", response_model=list[ApplicationSummary])
def list_my_applications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ApplicationSummary]:
    stmt = (
        select(Application)
        .where(Application.user_id == user.id)
        .options(selectinload(Application.game))
        .order_by(Application.submitted_at.desc())
    )
    rows = db.scalars(stmt).all()
    return [
        ApplicationSummary(
            id=a.id,
            game_id=a.game_id,
            game_title=a.game.title,
            game_suit=a.game.suit,
            game_rank=a.game.rank,
            status=a.status,
            submitted_at=a.submitted_at,
            decided_at=a.decided_at,
        )
        for a in rows
    ]


@router.get("/{application_id}", response_model=ApplicationDetail)
def get_my_application(
    application_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    app = db.get(Application, application_id)
    if app is None or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    return _detail(app)
