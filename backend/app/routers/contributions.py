"""Public student contribution portal.

A contribution is uploaded to Storage straight away but stays in the
`pending_resources` table until an administrator approves it. Only then is a
row created in `resources`, making the document visible in the live library.
"""

import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.routers.common import db_error, get_single, require_service
from app.constants import MAX_FILE_SIZE, PDF_MAGIC

router = APIRouter(tags=["contributions"])

API_V1_PREFIX = "/api/v1"

#: Extensions accepted by the contribution portal.
ALLOWED_EXTENSIONS = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}

#: Magic bytes used to confirm the real file type.
IMAGE_MAGIC = {
    ".png": b"\x89PNG\r\n\x1a\n",
    ".jpg": b"\xff\xd8\xff",
    ".jpeg": b"\xff\xd8\xff",
    ".webp": b"RIFF",
}

CONTRIBUTIONS_BUCKET = "academic-contributions"


class ContributionCreatedOut(BaseModel):
    id: str
    title: str
    category: str
    status: str
    semester_name: str | None
    module_code: str | None
    created_at: str


def _extension(filename: str) -> str:
    lowered = (filename or "").lower()
    for ext in ALLOWED_EXTENSIONS:
        if lowered.endswith(ext):
            return ext
    return ""


def validate_document(filename: str, content_type: str | None, data: bytes) -> str:
    """Validate an uploaded PDF or image. Returns the detected extension."""
    ext = _extension(filename)
    if not ext:
        raise HTTPException(
            status_code=400,
            detail="Format non supporté : envoyez un fichier PDF, PNG, JPG ou WEBP.",
        )

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Fichier trop volumineux : la taille maximale est de 25 Mo.",
        )

    if ext == ".pdf":
        if content_type and content_type != "application/pdf":
            raise HTTPException(
                status_code=415,
                detail="Type de fichier invalide : un PDF est attendu.",
            )
        if len(data) < len(PDF_MAGIC) or not data.startswith(PDF_MAGIC):
            raise HTTPException(
                status_code=400, detail="Le fichier n'est pas un PDF valide."
            )
        return ext

    if content_type and not content_type.startswith("image/"):
        raise HTTPException(
            status_code=415,
            detail="Type de fichier invalide : une image est attendue.",
        )

    magic = IMAGE_MAGIC[ext]
    if ext == ".webp":
        # RIFF....WEBP
        if len(data) < 12 or not data.startswith(magic) or data[8:12] != b"WEBP":
            raise HTTPException(
                status_code=400, detail="Le fichier n'est pas une image WEBP valide."
            )
        return ext

    if len(data) < len(magic) or not data.startswith(magic):
        raise HTTPException(
            status_code=400, detail="Le fichier n'est pas une image valide."
        )
    return ext


def _ensure_bucket(service) -> None:
    try:
        service.storage.get_bucket(CONTRIBUTIONS_BUCKET)
    except Exception:
        try:
            service.storage.create_bucket(CONTRIBUTIONS_BUCKET)
        except Exception:
            pass


def _validate_academic_year(value: str) -> str:
    import re

    match = re.match(r"^(\d{4})/(\d{4})$", (value or "").strip())
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
    return value.strip()


@router.post(
    f"{API_V1_PREFIX}/contributions",
    response_model=ContributionCreatedOut,
    status_code=201,
    summary="Submit a document for moderation (goes to the pending queue)",
)
async def create_contribution(
    title: str = Form(...),
    semester_id: str = Form(...),
    module_id: str = Form(...),
    category: str = Form("OTHERS"),
    academic_year: str = Form("2025/2026"),
    contributor_name: str = Form(""),
    contributor_email: str = Form(""),
    file: UploadFile = File(...),
) -> dict:
    service = require_service()

    # ---------------------------------------------------------- fields
    title = title.strip()
    if not 3 <= len(title) <= 200:
        raise HTTPException(
            status_code=400,
            detail="Le titre doit contenir entre 3 et 200 caractères.",
        )

    contributor_name = contributor_name.strip() or None
    if contributor_name and len(contributor_name) > 120:
        raise HTTPException(
            status_code=400,
            detail="Le nom du contributeur ne doit pas dépasser 120 caractères.",
        )

    contributor_email = contributor_email.strip().lower() or None
    if contributor_email:
        if len(contributor_email) > 160:
            raise HTTPException(
                status_code=400,
                detail="L'adresse e-mail ne doit pas dépasser 160 caractères.",
            )
        if "@" not in contributor_email or "." not in contributor_email.split("@")[-1]:
            raise HTTPException(
                status_code=400, detail="Adresse e-mail invalide."
            )

    if not contributor_name and not contributor_email:
        raise HTTPException(
            status_code=400,
            detail="Indiquez votre nom ou votre adresse e-mail pour que nous "
            "puissions vous recontacter.",
        )

    category = category.strip().upper()
    if category == "TD_TP":
        category = "TD"

    academic_year = _validate_academic_year(academic_year)

    # -------------------------------------------------- hierarchy check
    try:
        semester_uuid = uuid.UUID(semester_id)
        module_uuid = uuid.UUID(module_id)
    except (ValueError, AttributeError, TypeError) as exc:
        raise HTTPException(
            status_code=400, detail="Identifiant de semestre ou module invalide."
        ) from exc

    semester = get_single(service, "semesters", "id", str(semester_uuid))
    if semester is None:
        raise HTTPException(status_code=404, detail="Semestre introuvable.")

    module = get_single(service, "modules", "id", str(module_uuid))
    if module is None:
        raise HTTPException(status_code=404, detail="Module introuvable.")

    if module["semester_id"] != str(semester_uuid):
        raise HTTPException(
            status_code=400,
            detail="Ce module n'appartient pas au semestre sélectionné.",
        )

    # ---------------------------------------------------------- file
    data = await file.read(MAX_FILE_SIZE + 1)
    extension = validate_document(
        file.filename or "", file.content_type, data
    )

    _ensure_bucket(service)

    storage_path = f"contributions/{uuid.uuid4()}{extension}"
    try:
        service.storage.from_(CONTRIBUTIONS_BUCKET).upload(
            storage_path,
            data,
            {"content-type": ALLOWED_EXTENSIONS[extension], "upsert": "false"},
        )
    except Exception as exc:
        raise db_error(
            "Unable to upload the contribution to Supabase Storage "
            f"(bucket '{CONTRIBUTIONS_BUCKET}')",
            exc,
        ) from exc

    # ---------------------------------------------------------- insert
    try:
        response = (
            service.table("pending_resources")
            .insert(
                {
                    "title": title,
                    "category": category,
                    "file_url": storage_path,
                    "file_size": len(data),
                    "file_type": ALLOWED_EXTENSIONS[extension],
                    "contributor_name": contributor_name,
                    "contributor_email": contributor_email,
                    "semester_id": str(semester_uuid),
                    "module_id": str(module_uuid),
                    "academic_year": academic_year,
                }
            )
            .execute()
        )
    except Exception as exc:
        # Do not leave an orphaned file behind when the insert fails.
        try:
            service.storage.from_(CONTRIBUTIONS_BUCKET).remove([storage_path])
        except Exception:
            pass
        raise db_error(
            "Unable to record the contribution (table 'pending_resources')",
            exc,
        ) from exc

    row = (response.data or [])[0]

    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "status": "PENDING",
        "semester_name": semester.get("name"),
        "module_code": module.get("code"),
        "created_at": row["created_at"].isoformat()
        if hasattr(row["created_at"], "isoformat")
        else str(row["created_at"]),
    }


@router.get(
    f"{API_V1_PREFIX}/contributions/{{contribution_id}}",
    summary="Check the moderation status of a contribution",
)
async def get_contribution_status(contribution_id: uuid.UUID) -> dict:
    service = require_service()

    row = get_single(service, "pending_resources", "id", str(contribution_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Contribution introuvable.")

    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "status": "APPROVED" if row.get("reviewed_at") else "PENDING",
        "created_at": row["created_at"].isoformat()
        if hasattr(row["created_at"], "isoformat")
        else str(row["created_at"]),
    }
