"""Validation for the admin question-builder schema and applicant answers."""

from datetime import date

QUESTION_TYPES = {
    "short_text",
    "long_text",
    "single_choice",
    "multi_choice",
    "file",
    "number",
    "date",
    "url",
}
CHOICE_TYPES = {"single_choice", "multi_choice"}


class SchemaError(ValueError):
    """Raised when a game's question_schema is malformed."""


class AnswerError(ValueError):
    """Raised when applicant answers don't satisfy a game's schema."""


def validate_question_schema(schema: object) -> list[dict]:
    """Validate and normalize a question_schema list. Returns the clean list."""
    if not isinstance(schema, list):
        raise SchemaError("question_schema must be a list")

    seen_ids: set[str] = set()
    clean: list[dict] = []
    for i, q in enumerate(schema):
        if not isinstance(q, dict):
            raise SchemaError(f"Question {i} must be an object")
        qid = q.get("id")
        qtype = q.get("type")
        label = q.get("label")
        if not qid or not isinstance(qid, str):
            raise SchemaError(f"Question {i} is missing a string id")
        if qid in seen_ids:
            raise SchemaError(f"Duplicate question id: {qid}")
        seen_ids.add(qid)
        if qtype not in QUESTION_TYPES:
            raise SchemaError(f"Question {qid} has invalid type: {qtype}")
        if not label or not isinstance(label, str):
            raise SchemaError(f"Question {qid} is missing a label")

        item: dict = {
            "id": qid,
            "type": qtype,
            "label": label,
            "required": bool(q.get("required", False)),
        }
        if qtype in CHOICE_TYPES:
            options = q.get("options")
            if not isinstance(options, list) or len(options) < 1:
                raise SchemaError(f"Question {qid} must have at least one option")
            opts = [str(o) for o in options]
            if len(set(opts)) != len(opts):
                raise SchemaError(f"Question {qid} has duplicate options")
            item["options"] = opts
        if qtype in {"short_text", "long_text"} and q.get("maxLength") is not None:
            item["maxLength"] = int(q["maxLength"])
        clean.append(item)
    return clean


def validate_answers(
    schema: list[dict],
    answers: dict,
    uploaded_file_question_ids: set[str] | None = None,
) -> dict:
    """Validate answers against a schema. Returns the cleaned answers dict.

    `uploaded_file_question_ids` are file-type questions that already have an
    uploaded file registered, so the answers dict itself won't carry them.
    """
    if not isinstance(answers, dict):
        raise AnswerError("answers must be an object")
    uploaded = uploaded_file_question_ids or set()
    clean: dict = {}

    for q in schema:
        qid, qtype, required = q["id"], q["type"], q.get("required", False)
        raw = answers.get(qid)
        empty = raw is None or (isinstance(raw, (str, list)) and len(raw) == 0)

        if qtype == "file":
            if required and qid not in uploaded:
                raise AnswerError(f"'{q['label']}' requires a file")
            continue  # files are tracked in application_files, not answers

        if empty:
            if required:
                raise AnswerError(f"'{q['label']}' is required")
            continue

        clean[qid] = _validate_value(q, raw)
    return clean


def _validate_value(q: dict, raw: object):
    qtype, qid, label = q["type"], q["id"], q["label"]

    if qtype in {"short_text", "long_text"}:
        if not isinstance(raw, str):
            raise AnswerError(f"'{label}' must be text")
        max_len = q.get("maxLength")
        if max_len and len(raw) > max_len:
            raise AnswerError(f"'{label}' exceeds {max_len} characters")
        return raw

    if qtype == "number":
        try:
            return float(raw)
        except (TypeError, ValueError) as exc:
            raise AnswerError(f"'{label}' must be a number") from exc

    if qtype == "date":
        try:
            date.fromisoformat(str(raw))
        except ValueError as exc:
            raise AnswerError(f"'{label}' must be a valid date (YYYY-MM-DD)") from exc
        return str(raw)

    if qtype == "url":
        s = str(raw)
        if not (s.startswith("http://") or s.startswith("https://")):
            raise AnswerError(f"'{label}' must be a valid URL")
        return s

    if qtype == "single_choice":
        if raw not in q["options"]:
            raise AnswerError(f"'{label}' has an invalid selection")
        return raw

    if qtype == "multi_choice":
        if not isinstance(raw, list) or any(v not in q["options"] for v in raw):
            raise AnswerError(f"'{label}' has an invalid selection")
        return raw

    raise AnswerError(f"Unsupported question type for {qid}")
