import re
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.routers.common import (
    db_error,
    fetch,
    get_single,
    require_service,
    require_supabase,
)
from app.constants import (
    CONTRIBUTIONS_BUCKET,
    MAX_FILE_SIZE,
    PDF_MAGIC,
    RESOURCES_BUCKET,
)

router = APIRouter(tags=["submissions"])

API_V1_PREFIX = "/api/v1"

ALLOWED_CATEGORIES = {
    "COURS",
    "TD",
    "TP",
    "SLIDES",
    "EXAMS",
    "CORRECTIONS",
    "RESUMES",
    "OTHERS",
}
YEAR_PATTERN = re.compile(r"^(\d{4})/(\d{4})$")

bearer_scheme = HTTPBearer(auto_error=False)


class SubmissionCreatedOut(BaseModel):
    id: str
    title: str
    status: str
    created_at: datetime


class SubmissionOut(BaseModel):
    id: str
    title: str
    category: str
    status: str
    academic_year: str
    professor_name: str | None
    file_size: int | None
    file_url: str
    created_at: datetime
    module_title: str | None
    module_code: str | None
    semester_name: str | None
    field_name: str | None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentification requise : jeton Bearer manquant.",
        )

    client = require_supabase()

    try:
        response = client.auth.get_user(credentials.credentials)
    except Exception as exc:
        raise HTTPException(
            status_code=401, detail="Jeton invalide ou expiré."
        ) from exc

    if response is None or response.user is None:
        raise HTTPException(status_code=401, detail="Jeton invalide.")

    return response.user


def validate_pdf(filename: str, content_type: str | None, data: bytes) -> None:
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Seuls les fichiers PDF (.pdf) sont acceptés.",
        )

    if content_type and content_type not in ("application/pdf",):
        raise HTTPException(
            status_code=415,
            detail="Type de fichier invalide : un PDF est attendu (application/pdf).",
        )

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Fichier trop volumineux : la taille maximale est de 25 Mo.",
        )

    if len(data) < len(PDF_MAGIC) or not data.startswith(PDF_MAGIC):
        raise HTTPException(
            status_code=400,
            detail="Le fichier n'est pas un PDF valide.",
        )


def validate_academic_year(academic_year: str) -> str:
    match = YEAR_PATTERN.match(academic_year.strip())
    if not match:
        raise HTTPException(
            status_code=400,
            detail="L'année académique doit suivre le format AAAA/AAAA (ex : 2025/2026).",
        )
    start, end = int(match.group(1)), int(match.group(2))
    if end != start + 1:
        raise HTTPException(
            status_code=400,
            detail="L'année académique doit être consécutive (ex : 2025/2026).",
        )
    return academic_year.strip()


def validate_submission_form(
    title: str,
    category: str,
    academic_year: str,
    professor_name: str,
) -> tuple[str, str, str, str | None]:
    title = title.strip()
    if not 3 <= len(title) <= 200:
        raise HTTPException(
            status_code=400,
            detail="Le titre doit contenir entre 3 et 200 caractères.",
        )

    category = category.strip().upper()
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail="Catégorie invalide.",
        )

    academic_year = validate_academic_year(academic_year)

    professor_name = professor_name.strip() or None
    if professor_name and len(professor_name) > 120:
        raise HTTPException(
            status_code=400,
            detail="Le nom du professeur ne doit pas dépasser 120 caractères.",
        )

    return title, category, academic_year, professor_name


def _ensure_bucket(service) -> None:
    try:
        service.storage.get_bucket(CONTRIBUTIONS_BUCKET)
    except Exception:
        try:
            service.storage.create_bucket(CONTRIBUTIONS_BUCKET)
        except Exception:
            pass


def _map_submission(row: dict) -> dict:
    modules = row.get("modules") or {}
    semester = modules.get("semesters") or {}
    field = semester.get("academic_fields") or {}
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "status": row["status"],
        "academic_year": row["academic_year"],
        "professor_name": row.get("professor_name"),
        "file_size": row.get("file_size"),
        "file_url": row["file_url"],
        "created_at": row["created_at"],
        "module_title": modules.get("title"),
        "module_code": modules.get("code"),
        "semester_name": semester.get("name"),
        "field_name": field.get("name"),
    }


@router.post(
    f"{API_V1_PREFIX}/resources/submit",
    response_model=SubmissionCreatedOut,
    status_code=201,
    summary="Submit a resource (PDF) pending review",
)
async def submit_resource(
    title: str = Form(...),
    module_id: str = Form(...),
    category: str = Form(...),
    academic_year: str = Form(...),
    professor_name: str = Form(""),
    file: UploadFile = File(...),
    user=Depends(get_current_user),
) -> dict:
    title, category, academic_year, professor_name = validate_submission_form(
        title, category, academic_year, professor_name
    )

    try:
        module_uuid = uuid.UUID(module_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail="Identifiant de module invalide."
        ) from exc

    service = require_service()

    module = get_single(service, "modules", "id", str(module_uuid))
    if module is None:
        raise HTTPException(status_code=404, detail="Module introuvable.")

    data = await file.read(MAX_FILE_SIZE + 1)
    validate_pdf(file.filename or "", file.content_type, data)

    _ensure_bucket(service)

    storage_path = f"{user.id}/{uuid.uuid4()}.pdf"
    try:
        service.storage.from_(CONTRIBUTIONS_BUCKET).upload(
            storage_path,
            data,
            {"content-type": "application/pdf", "upsert": "false"},
        )
    except Exception as exc:
        raise db_error(
            "Unable to upload the submission to Supabase Storage "
            f"(bucket '{CONTRIBUTIONS_BUCKET}')",
            exc,
        ) from exc

    # Student submissions land in the moderation queue, never in the live
    # library: an administrator publishes them afterwards.
    try:
        response = (
            service.table("pending_resources")
            .insert(
                {
                    "module_id": str(module_uuid),
                    "title": title,
                    "category": category,
                    "academic_year": academic_year,
                    "contributor_name": professor_name,
                    "contributor_email": getattr(user, "email", None),
                    "file_size": len(data),
                    "file_url": storage_path,
                    "file_type": "application/pdf",
                }
            )
            .execute()
        )
    except Exception as exc:
        # Do not leave an orphaned file behind when the insert fails.
        try:
            service.storage.from_(RESOURCES_BUCKET).remove([storage_path])
        except Exception:
            pass
        raise db_error(
            "Unable to record the submission (table 'pending_resources')", exc
        ) from exc

    row = (response.data or [])[0]
    return {
        "id": row["id"],
        "title": row["title"],
        "status": "PENDING_REVIEW",
        "created_at": row["created_at"],
    }


@router.get(
    f"{API_V1_PREFIX}/resources/mine",
    response_model=list[SubmissionOut],
    summary="List the authenticated user's submissions",
)
async def list_my_submissions(
    user=Depends(get_current_user),
) -> list[dict]:
    service = require_service()

    rows = fetch(
        service.table("resources")
        .select(
            "id, title, category, status, academic_year, professor_name, "
            "file_size, file_url, created_at, "
            "modules(title, code, semesters(name, academic_fields(name)))"
        )
        .eq("uploader_id", user.id)
        .order("created_at", desc=True)
    )

    return [_map_submission(row) for row in rows]
