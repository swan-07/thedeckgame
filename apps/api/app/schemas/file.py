import uuid

from pydantic import BaseModel, ConfigDict


class SignUploadRequest(BaseModel):
    filename: str
    # "resume" for the profile resume, or a file-question id for an application.
    purpose: str = "resume"


class SignedUpload(BaseModel):
    path: str
    token: str
    signed_url: str


class FileRegister(BaseModel):
    storage_path: str
    filename: str
    content_type: str | None = None
    size: int | None = None
    question_id: str | None = None


class FileRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_id: str | None
    filename: str
    content_type: str | None
    size: int | None
    download_url: str | None = None
