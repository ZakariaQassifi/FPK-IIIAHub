import re
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Header
from pydantic import BaseModel

from app.config import get_settings
from app.notifications import (
    announcement_notification,
    resource_approved_notification,
    send_bulk_email,
)
from app.constants import CONTRIBUTIONS_BUCKET
from app.routers.common import (
    build_storage_url,
    db_error,
    fetch,
    get_single,
    logger,
    require_supabase,
    require_service,
)
from app.routers.submissions import (
    MAX_FILE_SIZE,
    RESOURCES_BUCKET,
    validate_pdf,
)
from app.schemas import TimetableOut

router = APIRouter(tags=["admin"])

API_V1_PREFIX = "/api/v1"

YEAR_PATTERN = re.compile(r"^(\d{4})/(\d{4})$")
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
QUEUE_STATUSES = ("PENDING_REVIEW", "PENDING")


class AdminStatsOut(BaseModel):
    total_resources: int
    pending_reviews: int
    total_students: int


class PendingResourceOut(BaseModel):
    id: str
    title: str
    category: str
    status: str
    academic_year: str
    professor_name: str | None
    file_size: int | None
    file_url: str
    created_at: datetime
    module_id: str
    module_title: str | None
    module_code: str | None
    semester_name: str | None
    field_name: str | None
    uploader_name: str | None


class ResourceMetadataUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    academic_year: str | None = None
    professor_name: str | None = None


class ResourceUpdatedOut(BaseModel):
    id: str
    title: str
    category: str
    status: str
    academic_year: str
    professor_name: str | None


class SignedUrlOut(BaseModel):
    url: str
    expires_in: int


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: str = "GENERAL"
    is_pinned: bool = False
    expires_at: datetime | None = None


class AnnouncementUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    is_pinned: bool | None = None
    expires_at: datetime | None = None
    clear_expiry: bool = False


class AnnouncementOut(BaseModel):
    id: str
    title: str
    content: str
    category: str
    is_pinned: bool
    created_at: datetime
    expires_at: datetime | None


async def get_admin_access(
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    """Authenticate admin via either custom JWT or Supabase Auth (Google OAuth).

    Accepts a Bearer token that is either:
    1. A custom JWT issued by /api/v1/admin/login (role=ADMIN), or
    2. A Supabase access token whose user has the ADMIN role.
    """
    settings = get_settings()

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Token d'authentification requis.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1]

    # 1) Try custom JWT first
    try:
        import jwt

        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        if payload.get("role") == "ADMIN":
            return {
                "sub": payload.get("sub"),
                "role": "ADMIN",
                "source": "jwt",
            }
    except Exception:
        pass

    # 2) Try Supabase Auth (Google OAuth flow)
    try:
        supabase = require_supabase()
        response = supabase.auth.get_user(token)
        if response and response.user:
            service = require_service()
            rows = fetch(
                service.table("users")
                .select("id, roles!inner(name)")
                .eq("id", response.user.id)
                .eq("roles.name", "ADMIN")
                .limit(1)
            )
            if rows:
                return {
                    "sub": response.user.id,
                    "role": "ADMIN",
                    "source": "supabase",
                }
    except Exception:
        pass

    raise HTTPException(
        status_code=401,
        detail="Token invalide, expiré ou accès non autorisé.",
        headers={"WWW-Authenticate": "Bearer"},
    )


# Alias for backwards compatibility with existing route signatures
get_admin_user = get_admin_access


def _count(service, table: str, filters: dict | None = None) -> int:
    query = service.table(table).select("id", count="exact")
    for column, value in (filters or {}).items():
        query = query.eq(column, value)
    response = query.execute()
    return response.count or 0


def get_single_by(service, table: str, filters: dict) -> dict | None:
    query = service.table(table).select("*")
    for column, value in filters.items():
        query = query.eq(column, value)
    rows = fetch(query.limit(1))
    return rows[0] if rows else None


def _validate_year(year: str) -> str:
    match = YEAR_PATTERN.match(year.strip())
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
    return year.strip()


def _map_pending(row: dict) -> dict:
    modules = row.get("modules") or {}
    semester = modules.get("semesters") or {}
    field = semester.get("academic_fields") or {}
    uploader = row.get("users") or {}
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
        "module_id": row["module_id"],
        "module_title": modules.get("title"),
        "module_code": modules.get("code"),
        "semester_name": semester.get("name"),
        "field_name": field.get("name"),
        "uploader_name": uploader.get("full_name"),
    }


@router.get(
    f"{API_V1_PREFIX}/admin/stats",
    response_model=AdminStatsOut,
    summary="Admin overview metrics",
)
async def admin_stats(admin=Depends(get_admin_user)) -> dict:
    service = require_service()

    student_role = get_single(service, "roles", "name", "STUDENT")

    return {
        "total_resources": _count(service, "resources"),
        "pending_reviews": _count(
            service, "resources", {"status": "PENDING_REVIEW"}
        ),
        "total_students": (
            _count(service, "users", {"role_id": student_role["id"]})
            if student_role
            else 0
        ),
    }


class PendingSubmissionOut(BaseModel):
    id: str
    title: str
    category: str
    academic_year: str
    file_url: str
    file_size: int | None
    file_type: str | None
    contributor_name: str | None
    contributor_email: str | None
    semester_id: str | None
    semester_name: str | None
    module_id: str | None
    module_title: str | None
    module_code: str | None
    created_at: datetime


def _map_pending_submission(row: dict) -> dict:
    semester = row.get("semesters") or {}
    module = row.get("modules") or {}
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "academic_year": row["academic_year"],
        "file_url": row["file_url"],
        "file_size": row.get("file_size"),
        "file_type": row.get("file_type"),
        "contributor_name": row.get("contributor_name"),
        "contributor_email": row.get("contributor_email"),
        "semester_id": row.get("semester_id"),
        "semester_name": semester.get("name"),
        "module_id": row.get("module_id"),
        "module_title": module.get("title"),
        "module_code": module.get("code"),
        "created_at": row["created_at"],
    }


@router.get(
    f"{API_V1_PREFIX}/admin/pending-submissions",
    response_model=list[PendingSubmissionOut],
    summary="List student contributions awaiting moderation",
)
async def list_pending_submissions(admin=Depends(get_admin_user)) -> list[dict]:
    service = require_service()

    rows = fetch(
        service.table("pending_resources")
        .select(
            "id, title, category, academic_year, file_url, file_size, "
            "file_type, contributor_name, contributor_email, "
            "semester_id, module_id, created_at, "
            "modules(title, code), semesters(name)"
        )
        .is_("reviewed_at", "null")
        .order("created_at", desc=True)
    )
    return [_map_pending_submission(row) for row in rows]


def _get_pending_submission_or_404(service, contribution_id: uuid.UUID) -> dict:
    row = get_single(
        service, "pending_resources", "id", str(contribution_id)
    )
    if row is None:
        raise HTTPException(
            status_code=404, detail="Contribution introuvable."
        )
    return row


@router.get(
    f"{API_V1_PREFIX}/admin/pending-submissions/{{contribution_id}}/signed-url",
    response_model=SignedUrlOut,
    summary="Preview or download a submitted contribution",
)
async def get_pending_submission_signed_url(
    contribution_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()
    row = _get_pending_submission_or_404(service, contribution_id)

    storage_path = row.get("file_url")
    if not storage_path:
        raise HTTPException(status_code=404, detail="Fichier introuvable.")

    try:
        result = service.storage.from_(CONTRIBUTIONS_BUCKET).create_signed_url(
            storage_path, 3600
        )
    except Exception as exc:
        raise db_error(
            f"Unable to sign '{storage_path}' in bucket '{CONTRIBUTIONS_BUCKET}'",
            exc,
        ) from exc

    signed = (
        result.get("signedURL")
        if isinstance(result, dict)
        else getattr(result, "signed_url", None)
    )
    if not signed:
        raise HTTPException(
            status_code=502, detail="Lien de prévisualisation indisponible."
        )

    return {
        "url": build_storage_url(signed),
        "expires_in": 3600,
    }


@router.post(
    f"{API_V1_PREFIX}/admin/pending-submissions/{{contribution_id}}/approve",
    response_model=ResourceUpdatedOut,
    summary="Approve a contribution and publish it in the live library",
)
async def approve_pending_submission(
    contribution_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()
    row = _get_pending_submission_or_404(service, contribution_id)

    module_id = row.get("module_id")
    if not module_id:
        raise HTTPException(
            status_code=400,
            detail="Cette contribution n'est rattachée à aucun module.",
        )

    # The file is already in Storage: publishing only creates the live row.
    # Moderated contributions are always published under "OTHERS"; an
    # administrator can re-categorise them later from the resource editor.
    try:
        response = (
            service.table("resources")
            .insert(
                {
                    "module_id": module_id,
                    "title": row["title"],
                    "category": "OTHERS",
                    "academic_year": row["academic_year"],
                    "professor_name": row.get("contributor_name"),
                    "file_size": row.get("file_size"),
                    "file_url": row["file_url"],
                    "uploader_id": None,
                    "status": "APPROVED",
                }
            )
            .execute()
        )
    except Exception as exc:
        raise db_error(
            "Unable to publish the contribution (table 'resources')", exc
        ) from exc

    try:
        service.table("pending_resources").update(
            {"reviewed_at": datetime.now(timezone.utc)}
        ).eq("id", str(contribution_id)).execute()
    except Exception:
        logger.warning(
            "Contribution %s published but the queue row could not be flagged.",
            contribution_id,
            exc_info=True,
        )

    created = (response.data or [])[0]
    return {
        "id": created["id"],
        "title": created["title"],
        "category": created["category"],
        "status": created["status"],
        "academic_year": created["academic_year"],
        "professor_name": created.get("professor_name"),
    }


@router.delete(
    f"{API_V1_PREFIX}/admin/pending-submissions/{{contribution_id}}",
    summary="Reject a contribution and delete its file",
)
async def reject_pending_submission(
    contribution_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()
    row = _get_pending_submission_or_404(service, contribution_id)

    storage_path = row.get("file_url")
    deleted_files = 0
    if storage_path:
        try:
            service.storage.from_(CONTRIBUTIONS_BUCKET).remove([storage_path])
            deleted_files = 1
        except Exception:
            logger.warning(
                "Could not delete the stored file for contribution %s.",
                contribution_id,
                exc_info=True,
            )

    try:
        service.table("pending_resources").delete().eq(
            "id", str(contribution_id)
        ).execute()
    except Exception as exc:
        raise db_error(
            "Unable to delete the contribution (table 'pending_resources')",
            exc,
        ) from exc

    return {
        "id": str(contribution_id),
        "deleted": True,
        "deleted_files": deleted_files,
    }


@router.get(
    f"{API_V1_PREFIX}/admin/pending-resources",
    response_model=list[PendingResourceOut],
    summary="List resources awaiting review",
)
async def list_pending_resources(admin=Depends(get_admin_user)) -> list[dict]:
    service = require_service()

    rows = fetch(
        service.table("resources")
        .select(
            "id, title, category, status, academic_year, professor_name, "
            "file_size, file_url, created_at, module_id, "
            "modules(title, code, semesters(name, academic_fields(name))), "
            "users(full_name)"
        )
        .in_("status", list(QUEUE_STATUSES))
        .order("created_at")
    )
    return [_map_pending(row) for row in rows]


def _get_resource_or_404(service, resource_id: uuid.UUID) -> dict:
    row = get_single(service, "resources", "id", str(resource_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Ressource introuvable.")
    return row


@router.patch(
    f"{API_V1_PREFIX}/admin/resources/{{resource_id}}/approve",
    response_model=ResourceUpdatedOut,
    summary="Approve a pending resource",
)
async def approve_resource(
    resource_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()
    _get_resource_or_404(service, resource_id)

    response = (
        service.table("resources")
        .update({"status": "APPROVED"})
        .eq("id", str(resource_id))
        .execute()
    )
    row = (response.data or [])[0]

    # --- Notification: email all students about the approved resource ---
    try:
        service = require_service()
        student_role = get_single(service, "roles", "name", "STUDENT")
        if student_role:
            student_rows = fetch(
                service.table("users")
                .select("email")
                .eq("role_id", student_role["id"])
            )
            recipient_emails = [
                r["email"] for r in student_rows if r.get("email")
            ]
            if recipient_emails:
                # Fetch module title for the email
                module = get_single(
                    service, "modules", "id", row["module_id"]
                )
                module_title = module.get("title", "") if module else ""
                subject, text, html = resource_approved_notification(
                    recipient_emails[0],  # placeholder, not used for bulk
                    row["title"],
                    row["category"],
                    module_title,
                )
                send_bulk_email(recipient_emails, subject, text, html)
    except Exception:
        # Email failure must not roll back the approval
        pass

    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "status": row["status"],
        "academic_year": row["academic_year"],
        "professor_name": row.get("professor_name"),
    }


@router.patch(
    f"{API_V1_PREFIX}/admin/resources/{{resource_id}}/reject",
    response_model=ResourceUpdatedOut,
    summary="Reject a pending resource",
)
async def reject_resource(
    resource_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()
    _get_resource_or_404(service, resource_id)

    response = (
        service.table("resources")
        .update({"status": "REJECTED"})
        .eq("id", str(resource_id))
        .execute()
    )
    row = (response.data or [])[0]
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "status": row["status"],
        "academic_year": row["academic_year"],
        "professor_name": row.get("professor_name"),
    }


@router.patch(
    f"{API_V1_PREFIX}/admin/resources/{{resource_id}}",
    response_model=ResourceUpdatedOut,
    summary="Edit pending resource metadata",
)
async def update_resource_metadata(
    resource_id: uuid.UUID,
    payload: ResourceMetadataUpdate,
    admin=Depends(get_admin_user),
) -> dict:
    service = require_service()
    _get_resource_or_404(service, resource_id)

    updates: dict = {}

    if payload.title is not None:
        title = payload.title.strip()
        if not 3 <= len(title) <= 200:
            raise HTTPException(
                status_code=400,
                detail="Le titre doit contenir entre 3 et 200 caractères.",
            )
        updates["title"] = title

    if payload.category is not None:
        category = payload.category.strip().upper()
        if category not in ALLOWED_CATEGORIES:
            raise HTTPException(status_code=400, detail="Catégorie invalide.")
        updates["category"] = category

    if payload.academic_year is not None:
        updates["academic_year"] = _validate_year(payload.academic_year)

    if payload.professor_name is not None:
        name = payload.professor_name.strip()
        if len(name) > 120:
            raise HTTPException(
                status_code=400,
                detail="Le nom du professeur ne doit pas dépasser 120 caractères.",
            )
        updates["professor_name"] = name or None

    if not updates:
        raise HTTPException(status_code=400, detail="Aucune modification fournie.")

    response = (
        service.table("resources")
        .update(updates)
        .eq("id", str(resource_id))
        .execute()
    )
    row = (response.data or [])[0]
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "status": row["status"],
        "academic_year": row["academic_year"],
        "professor_name": row.get("professor_name"),
    }


@router.get(
    f"{API_V1_PREFIX}/admin/resources/{{resource_id}}/signed-url",
    response_model=SignedUrlOut,
    summary="Get a temporary signed URL to preview a resource file",
)
async def get_resource_signed_url(
    resource_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()
    row = _get_resource_or_404(service, resource_id)

    try:
        result = service.storage.from_(RESOURCES_BUCKET).create_signed_url(
            row["file_url"], 3600
        )
    except Exception as exc:
        raise db_error(
            f"Unable to sign '{row['file_url']}' in bucket '{RESOURCES_BUCKET}'",
            exc,
        ) from exc

    signed = (
        result.get("signedURL")
        if isinstance(result, dict)
        else getattr(result, "signed_url", None)
    )
    if not signed:
        raise HTTPException(
            status_code=502, detail="URL de prévisualisation indisponible."
        )

    return {"url": build_storage_url(signed), "expires_in": 3600}


@router.post(
    f"{API_V1_PREFIX}/admin/timetables",
    response_model=TimetableOut,
    status_code=201,
    summary="Upload or replace the timetable of a semester",
)
async def upload_timetable(
    semester_id: str = Form(...),
    academic_year: str = Form(...),
    file: UploadFile = File(...),
    admin=Depends(get_admin_user),
) -> dict:
    service = require_service()

    try:
        semester_uuid = uuid.UUID(semester_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail="Identifiant de semestre invalide."
        ) from exc

    semester = get_single(service, "semesters", "id", str(semester_uuid))
    if semester is None:
        raise HTTPException(status_code=404, detail="Semestre introuvable.")

    academic_year = _validate_year(academic_year)

    data = await file.read(MAX_FILE_SIZE + 1)
    validate_pdf(file.filename or "", file.content_type, data)

    storage_path = f"timetables/{semester_uuid}/{uuid.uuid4()}.pdf"
    try:
        service.storage.from_(RESOURCES_BUCKET).upload(
            storage_path,
            data,
            {"content-type": "application/pdf", "upsert": "false"},
        )
    except Exception as exc:
        raise db_error(
            "Unable to upload the file to Supabase Storage "
            f"(bucket '{RESOURCES_BUCKET}')",
            exc,
        ) from exc

    try:
        (
            service.table("timetables")
            .upsert(
                {
                    "semester_id": str(semester_uuid),
                    "academic_year": academic_year,
                    "file_url": storage_path,
                },
                on_conflict="semester_id,academic_year",
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Échec de l'enregistrement de l'emploi du temps."
        ) from exc

    row = get_single_by(
        service,
        "timetables",
        {
            "semester_id": str(semester_uuid),
            "academic_year": academic_year,
        },
    )
    return {
        "id": row["id"],
        "semester_id": row["semester_id"],
        "file_url": row["file_url"],
        "academic_year": row["academic_year"],
        "updated_at": row["updated_at"],
    }


class AdminResourceUploadOut(BaseModel):
    id: str
    title: str
    category: str
    status: str
    academic_year: str
    professor_name: str | None
    module_id: str
    created_at: datetime


@router.post(
    f"{API_V1_PREFIX}/admin/resources/upload",
    response_model=AdminResourceUploadOut,
    status_code=201,
    summary="Upload a resource as an administrator (auto-approved)",
)
async def admin_upload_resource(
    title: str = Form(...),
    category: str = Form(...),
    academic_year: str = Form(...),
    module_id: str = Form(""),
    module_name: str = Form(""),
    semester_id: str = Form(""),
    module_code: str = Form(""),
    professor_name: str = Form(""),
    file: UploadFile = File(...),
    admin=Depends(get_admin_user),
) -> dict:
    service = require_service()

    # Validate title
    title = title.strip()
    if not 3 <= len(title) <= 200:
        raise HTTPException(
            status_code=400,
            detail="Le titre doit contenir entre 3 et 200 caractères.",
        )

    # Resolve the module: either an existing one was picked, or a new module
    # is created on the fly from the typed name + selected semester.
    module = None

    if module_id:
        try:
            module_uuid = uuid.UUID(module_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=400, detail="Identifiant de module invalide."
            ) from exc

        module = get_single(service, "modules", "id", str(module_uuid))
        if module is None:
            raise HTTPException(status_code=404, detail="Module introuvable.")
    else:
        typed_name = module_name.strip()
        if not typed_name:
            raise HTTPException(
                status_code=400,
                detail="Sélectionnez un module ou saisissez son nom.",
            )
        if not 3 <= len(typed_name) <= 200:
            raise HTTPException(
                status_code=400,
                detail="Le nom du module doit contenir entre 3 et 200 caractères.",
            )
        if not semester_id:
            raise HTTPException(
                status_code=400,
                detail="Sélectionnez le semestre du nouveau module.",
            )

        semester = get_single(service, "semesters", "id", semester_id)
        if semester is None:
            raise HTTPException(status_code=404, detail="Semestre introuvable.")

        code = module_code.strip().upper() or typed_name[:12].upper().replace(" ", "")
        if not 2 <= len(code) <= 30:
            raise HTTPException(
                status_code=400,
                detail="Le code du module doit contenir entre 2 et 30 caractères.",
            )

        existing = get_single_by(
            service,
            "modules",
            {"semester_id": semester_id, "code": code},
        )

        if existing is not None:
            module = existing
        else:
            try:
                created = (
                    service.table("modules")
                    .insert(
                        {
                            "semester_id": semester_id,
                            "title": typed_name,
                            "code": code,
                            "description": None,
                        }
                    )
                    .execute()
                )
            except Exception as exc:
                raise HTTPException(
                    status_code=500, detail="Échec de la création du module."
                ) from exc
            module = (created.data or [])[0]

    # Validate category
    category = category.strip().upper()
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail="Catégorie invalide.")

    # Validate academic year
    academic_year = _validate_year(academic_year)

    # Validate professor name
    professor_name = professor_name.strip() or None
    if professor_name and len(professor_name) > 120:
        raise HTTPException(
            status_code=400,
            detail="Le nom du professeur ne doit pas dépasser 120 caractères.",
        )

    # Validate PDF file
    data = await file.read(MAX_FILE_SIZE + 1)
    validate_pdf(file.filename or "", file.content_type, data)

    # Ensure bucket exists
    try:
        service.storage.get_bucket(RESOURCES_BUCKET)
    except Exception:
        try:
            service.storage.create_bucket(RESOURCES_BUCKET)
        except Exception:
            pass

    # Upload file to storage
    storage_path = f"admin/{uuid.uuid4()}.pdf"
    try:
        service.storage.from_(RESOURCES_BUCKET).upload(
            storage_path,
            data,
            {"content-type": "application/pdf", "upsert": "false"},
        )
    except Exception as exc:
        raise db_error(
            "Unable to upload the file to Supabase Storage "
            f"(bucket '{RESOURCES_BUCKET}')",
            exc,
        ) from exc

    # Insert resource as APPROVED (admin uploads are trusted)
    try:
        response = (
            service.table("resources")
            .insert(
                {
                    "module_id": module["id"],
                    "title": title,
                    "category": category,
                    "academic_year": academic_year,
                    "professor_name": professor_name,
                    "file_size": len(data),
                    "file_url": storage_path,
                    "uploader_id": None,
                    "status": "APPROVED",
                }
            )
            .execute()
        )
    except Exception as exc:
        raise db_error(
            "Unable to save the resource (table 'resources')", exc
        ) from exc

    row = (response.data or [])[0]

    # --- Notification: email all students about the new approved resource ---
    try:
        student_role = get_single(service, "roles", "name", "STUDENT")
        if student_role:
            student_rows = fetch(
                service.table("users")
                .select("email")
                .eq("role_id", student_role["id"])
            )
            recipient_emails = [
                r["email"] for r in student_rows if r.get("email")
            ]
            if recipient_emails:
                subject, text, html = resource_approved_notification(
                    recipient_emails[0],
                    row["title"],
                    row["category"],
                    module.get("title", ""),
                )
                send_bulk_email(recipient_emails, subject, text, html)
    except Exception:
        # Email failure must not roll back the resource creation
        pass

    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "status": row["status"],
        "academic_year": row["academic_year"],
        "professor_name": row.get("professor_name"),
        "module_id": row["module_id"],
        "created_at": row["created_at"],
    }


def _map_announcement(row: dict) -> dict:
    """Map a database announcement row onto the public response shape."""
    return {
        "id": row["id"],
        "title": row["title"],
        "content": row["content"],
        "category": row["category"],
        "is_pinned": row["is_pinned"],
        "created_at": row["created_at"],
        "expires_at": row.get("expires_at"),
    }


#: Categories accepted by the announcements table. Kept aligned with the
#: IIIAAnnouncement type used by the frontend so the badge always resolves.
ANNOUNCEMENT_CATEGORIES = ("EXAMEN", "ADMINISTRATIF", "PEDAGOGIQUE", "GENERAL")


def _normalize_announcement_category(category: str) -> str:
    """Validate and normalise a category against the allowed set."""
    normalized = category.strip().upper()
    if normalized not in ANNOUNCEMENT_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Catégorie « {category} » invalide. "
                f"Valeurs acceptées : {', '.join(ANNOUNCEMENT_CATEGORIES)}."
            ),
        )
    return normalized


def _resolve_author_id(admin) -> str | None:
    """Return the author uuid for the current admin, or None.

    ``announcements.author_id`` is a uuid column referencing public.users.
    A JWT admin has no Supabase user row, so the value must stay NULL rather
    than a username, which Postgres would reject as an invalid uuid.
    """
    if not isinstance(admin, dict):
        return None
    if admin.get("source") != "supabase":
        return None

    sub = admin.get("sub")
    if not sub:
        return None
    try:
        return str(uuid.UUID(str(sub)))
    except (ValueError, AttributeError, TypeError):
        logger.warning("Ignoring non-uuid author id from session: %r", sub)
        return None


def _serialize_expires_at(value: datetime | None) -> str | None:
    """Serialise a datetime for the ``expires_at`` timestamptz column."""
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


def _validate_announcement_fields(
    title: str | None, content: str | None, category: str | None
) -> dict:
    updates: dict = {}

    if title is not None:
        title = title.strip()
        if not 3 <= len(title) <= 200:
            raise HTTPException(
                status_code=400,
                detail="Le titre doit contenir entre 3 et 200 caractères.",
            )
        updates["title"] = title

    if content is not None:
        content = content.strip()
        if not 10 <= len(content) <= 2000:
            raise HTTPException(
                status_code=400,
                detail="Le contenu doit contenir entre 10 et 2000 caractères.",
            )
        updates["content"] = content

    if category is not None:
        updates["category"] = _normalize_announcement_category(category)

    return updates


@router.get(
    f"{API_V1_PREFIX}/admin/announcements",
    response_model=list[AnnouncementOut],
    summary="List all announcements",
)
async def list_all_announcements(admin=Depends(get_admin_user)) -> list[dict]:
    service = require_service()
    rows = fetch(
        service.table("announcements").select("*").order("created_at", desc=True)
    )
    return [_map_announcement(row) for row in rows]


@router.post(
    f"{API_V1_PREFIX}/admin/announcements",
    response_model=AnnouncementOut,
    status_code=201,
    summary="Create an announcement",
)
async def create_announcement(
    payload: AnnouncementCreate, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()

    updates = _validate_announcement_fields(
        payload.title, payload.content, payload.category
    )

    # Column names mirror the announcements table exactly:
    #   title text | content text | category text
    #   author_id uuid | is_pinned boolean | expires_at timestamptz
    row_payload = {
        "title": updates["title"],
        "content": updates["content"],
        "category": updates["category"],
        "is_pinned": payload.is_pinned,
        "expires_at": _serialize_expires_at(payload.expires_at),
        "author_id": _resolve_author_id(admin),
    }

    try:
        response = (
            service.table("announcements").insert(row_payload).execute()
        )
    except Exception as exc:
        raise db_error(
            "Unable to create the announcement (table 'announcements')", exc
        ) from exc

    rows = response.data or []
    if not rows:
        raise HTTPException(
            status_code=502,
            detail=(
                "L’annonce n’a pas pu être enregistrée : "
                "Supabase n’a retourné aucune ligne."
            ),
        )
    row = rows[0]

    # --- Notification: email all students about the new announcement ---
    try:
        student_role = get_single(service, "roles", "name", "STUDENT")
        if student_role:
            student_rows = fetch(
                service.table("users")
                .select("email")
                .eq("role_id", student_role["id"])
            )
            recipient_emails = [
                r["email"] for r in student_rows if r.get("email")
            ]
            if recipient_emails:
                subject, text, html = announcement_notification(
                    recipient_emails[0],  # placeholder, not used for bulk
                    row["title"],
                    row["content"],
                    row["category"],
                )
                send_bulk_email(recipient_emails, subject, text, html)
    except Exception:
        # Email failure must not roll back the announcement creation
        logger.warning(
            "Announcement %s created but the email notification failed.",
            row.get("id"),
            exc_info=True,
        )

    return _map_announcement(row)


def _get_announcement_or_404(service, announcement_id: uuid.UUID) -> dict:
    row = get_single(service, "announcements", "id", str(announcement_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Annonce introuvable.")
    return row


@router.patch(
    f"{API_V1_PREFIX}/admin/announcements/{{announcement_id}}",
    response_model=AnnouncementOut,
    summary="Update an announcement (edit or pin/unpin)",
)
async def update_announcement(
    announcement_id: uuid.UUID,
    payload: AnnouncementUpdate,
    admin=Depends(get_admin_user),
) -> dict:
    service = require_service()
    _get_announcement_or_404(service, announcement_id)

    updates: dict = {}
    if (
        payload.title is not None
        or payload.content is not None
        or payload.category is not None
    ):
        updates.update(
            _validate_announcement_fields(
                payload.title, payload.content, payload.category
            )
        )
    if payload.is_pinned is not None:
        updates["is_pinned"] = payload.is_pinned
    if payload.expires_at is not None:
        updates["expires_at"] = _serialize_expires_at(payload.expires_at)
    elif payload.clear_expiry:
        updates["expires_at"] = None

    if not updates:
        raise HTTPException(
            status_code=400, detail="Aucune modification fournie."
        )

    try:
        response = (
            service.table("announcements")
            .update(updates)
            .eq("id", str(announcement_id))
            .execute()
        )
    except Exception as exc:
        raise db_error(
            "Unable to update the announcement (table 'announcements')", exc
        ) from exc

    rows = response.data or []
    if not rows:
        raise HTTPException(
            status_code=502,
            detail=(
                "L’annonce n’a pas pu être mise à jour : "
                "Supabase n’a retourné aucune ligne."
            ),
        )
    return _map_announcement(rows[0])


@router.delete(
    f"{API_V1_PREFIX}/admin/announcements/{{announcement_id}}",
    summary="Delete an announcement",
)
async def delete_announcement(
    announcement_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()
    _get_announcement_or_404(service, announcement_id)

    try:
        service.table("announcements").delete().eq(
            "id", str(announcement_id)
        ).execute()
    except Exception as exc:
        raise db_error(
            "Unable to delete the announcement (table 'announcements')", exc
        ) from exc

    return {"id": str(announcement_id), "deleted": True}


# ---------------------------------------------------------------------------
# Academic hierarchy management (modules)
# ---------------------------------------------------------------------------


IIIA_FIELD_SLUG = "genie-informatique-ia"

#: A semester may hold at most this many modules.
MAX_MODULES_PER_SEMESTER = 7


#: French/English stop words ignored when deriving a module code.
_MODULE_CODE_STOPWORDS = {
    "de", "des", "du", "un", "une", "le", "la", "les", "et", "a", "à",
    "au", "aux", "en", "pour", "sur", "avec", "dans", "par", "the", "and",
    "of", "in", "on", "d",
}


def _generate_module_code(title: str, siblings: list[dict]) -> str:
    """Derive a unique, readable module code from its title.

    Uses the initials of the significant words (e.g. "Bases de donnees"
    -> "BD"), falling back to the leading characters of the first word when
    too few initials remain, and appending a counter on collision.
    """
    words = [w for w in re.split(r"[^A-Za-z0-9]+", title) if w]
    significant = [w for w in words if w.lower() not in _MODULE_CODE_STOPWORDS]
    if not significant:
        significant = words

    initials = "".join(w[0] for w in significant).upper()

    if len(initials) < 2:
        # Not enough initials: use the beginning of the first significant word.
        initials = significant[0][:4].upper() if significant else "MOD"

    base = initials[:10] or "MOD"

    taken = {row.get("code", "").upper() for row in siblings}
    if base not in taken:
        return base

    for suffix in range(2, 100):
        candidate = f"{base[:8]}{suffix}"
        if candidate not in taken:
            return candidate

    return base


class AdminModuleOut(BaseModel):
    id: str
    title: str
    code: str
    description: str | None
    semester_id: str
    semester_name: str | None
    semester_slug: str | None
    resource_count: int = 0


class AdminModuleCreate(BaseModel):
    semester_id: str
    title: str
    code: str = ""
    description: str | None = None


def _map_admin_module(row: dict, resource_count: int = 0) -> dict:
    semester = row.get("semesters") or {}
    return {
        "id": row["id"],
        "title": row["title"],
        "code": row["code"],
        "description": row.get("description"),
        "semester_id": row.get("semester_id") or semester.get("id"),
        "semester_name": semester.get("name"),
        "semester_slug": semester.get("slug"),
        "resource_count": resource_count,
    }


@router.get(
    f"{API_V1_PREFIX}/admin/modules",
    response_model=list[AdminModuleOut],
    summary="List modules (optionally filtered by semester)",
)
async def list_admin_modules(
    semester_id: str | None = None, admin=Depends(get_admin_user)
) -> list[dict]:
    service = require_service()

    query = service.table("modules").select(
        "id, title, code, description, semester_id, "
        "semesters(name, slug)"
    )
    if semester_id:
        query = query.eq("semester_id", semester_id)

    rows = fetch(query.order("code"))

    counts: dict[str, int] = {}
    if rows:
        resource_rows = fetch(
            service.table("resources")
            .select("module_id, status")
            .eq("status", "APPROVED")
        )
        for resource in resource_rows:
            counts[resource["module_id"]] = counts.get(resource["module_id"], 0) + 1

    return [
        _map_admin_module(row, counts.get(row["id"], 0))
        for row in rows
    ]


@router.post(
    f"{API_V1_PREFIX}/admin/modules",
    response_model=AdminModuleOut,
    status_code=201,
    summary="Create a module inside a semester",
)
async def create_admin_module(
    payload: AdminModuleCreate, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()

    title = payload.title.strip()
    if not 3 <= len(title) <= 200:
        raise HTTPException(
            status_code=400,
            detail="Le titre du module doit contenir entre 3 et 200 caractères.",
        )

    semester = get_single(service, "semesters", "id", payload.semester_id)
    if semester is None:
        raise HTTPException(status_code=404, detail="Semestre introuvable.")

    # Business rule: a semester holds at most MAX_MODULES_PER_SEMESTER modules.
    existing_modules = fetch(
        service.table("modules")
        .select("id, code, title")
        .eq("semester_id", payload.semester_id)
    )
    if len(existing_modules) >= MAX_MODULES_PER_SEMESTER:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Ce semestre contient déjà {MAX_MODULES_PER_SEMESTER} modules "
                f"(limite maximale). Supprimez un module avant d'en ajouter un nouveau."
            ),
        )

    # A module title must be unique inside its semester.
    for existing in existing_modules:
        if existing.get("title", "").strip().lower() == title.lower():
            raise HTTPException(
                status_code=409,
                detail="Un module portant ce nom existe déjà dans ce semestre.",
            )

    code = payload.code.strip().upper()
    if not code:
        code = _generate_module_code(title, existing_modules)
    if not 2 <= len(code) <= 30:
        raise HTTPException(
            status_code=400,
            detail="Le code du module doit contenir entre 2 et 30 caractères.",
        )

    existing = get_single_by(
        service,
        "modules",
        {"semester_id": payload.semester_id, "code": code},
    )
    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Un module portant ce code existe déjà dans ce semestre.",
        )

    try:
        response = (
            service.table("modules")
            .insert(
                {
                    "semester_id": payload.semester_id,
                    "title": title,
                    "code": code,
                    "description": (payload.description or "").strip() or None,
                }
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Échec de la création du module."
        ) from exc

    row = (response.data or [])[0]
    return _map_admin_module(row, 0)


class AdminModuleUpdate(BaseModel):
    title: str | None = None
    code: str | None = None
    description: str | None = None


@router.patch(
    f"{API_V1_PREFIX}/admin/modules/{{module_id}}",
    response_model=AdminModuleOut,
    summary="Rename a module",
)
async def update_admin_module(
    module_id: uuid.UUID,
    payload: AdminModuleUpdate,
    admin=Depends(get_admin_user),
) -> dict:
    service = require_service()

    row = get_single(service, "modules", "id", str(module_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Module introuvable.")

    updates: dict = {}

    if payload.title is not None:
        title = payload.title.strip()
        if not 3 <= len(title) <= 200:
            raise HTTPException(
                status_code=400,
                detail="Le titre du module doit contenir entre 3 et 200 caractères.",
            )

        siblings = fetch(
            service.table("modules")
            .select("id, title")
            .eq("semester_id", row["semester_id"])
        )
        for sibling in siblings:
            if sibling["id"] != str(module_id) and (
                sibling.get("title", "").strip().lower() == title.lower()
            ):
                raise HTTPException(
                    status_code=409,
                    detail="Un module portant ce nom existe déjà dans ce semestre.",
                )
        updates["title"] = title

    if payload.code is not None:
        code = payload.code.strip().upper()
        if not 2 <= len(code) <= 30:
            raise HTTPException(
                status_code=400,
                detail="Le code du module doit contenir entre 2 et 30 caractères.",
            )
        updates["code"] = code

    if payload.description is not None:
        updates["description"] = payload.description.strip() or None

    if not updates:
        raise HTTPException(
            status_code=400, detail="Aucune modification fournie."
        )

    response = (
        service.table("modules")
        .update(updates)
        .eq("id", str(module_id))
        .execute()
    )
    updated = (response.data or [])[0]

    count = _count(service, "resources", {"module_id": str(module_id)})
    return _map_admin_module(updated, count)


def _delete_storage_objects(paths: list[str]) -> int:
    """Remove storage objects from the bucket. Returns the number deleted.

    Storage objects live outside the relational schema, so a database
    ON DELETE CASCADE never touches them: they must be purged explicitly to
    avoid orphaned files.
    """
    if not paths:
        return 0

    service = require_service()
    deleted = 0
    for path in paths:
        try:
            service.storage.from_(RESOURCES_BUCKET).remove([path])
            deleted += 1
        except Exception:
            continue
    return deleted


@router.delete(
    f"{API_V1_PREFIX}/admin/modules/{{module_id}}",
    summary="Delete a module (cascades to its resources and their files)",
)
async def delete_admin_module(
    module_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()

    row = get_single(service, "modules", "id", str(module_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Module introuvable.")

    # Collect the attached resources and their storage paths *before* the
    # delete: the FK ON DELETE CASCADE will drop the resource rows, but the
    # binary files live in Supabase Storage and need explicit cleanup.
    resource_rows = fetch(
        service.table("resources")
        .select("id, file_url")
        .eq("module_id", str(module_id))
    )
    storage_paths = [
        r["file_url"] for r in resource_rows if r.get("file_url")
    ]

    try:
        # resources.module_id is ON DELETE CASCADE -> resource rows disappear.
        service.table("modules").delete().eq("id", str(module_id)).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Échec de la suppression du module."
        ) from exc

    # Defensive sweep: if the ON DELETE CASCADE constraint were ever missing
    # on a legacy database, no resource row may be left dangling.
    try:
        service.table("resources").delete().eq(
            "module_id", str(module_id)
        ).execute()
    except Exception:
        pass

    deleted_files = _delete_storage_objects(storage_paths)

    return {
        "id": str(module_id),
        "deleted": True,
        "deleted_resources": len(resource_rows),
        "deleted_files": deleted_files,
    }


# ---------------------------------------------------------------------------
# Full resource CRUD
# ---------------------------------------------------------------------------


class AdminResourceOut(BaseModel):
    id: str
    title: str
    category: str
    status: str
    academic_year: str
    professor_name: str | None
    file_size: int | None
    file_url: str
    module_id: str
    module_title: str | None
    module_code: str | None
    semester_name: str | None
    created_at: datetime


@router.get(
    f"{API_V1_PREFIX}/admin/resources",
    response_model=list[AdminResourceOut],
    summary="List every resource (all statuses)",
)
async def list_admin_resources(admin=Depends(get_admin_user)) -> list[dict]:
    service = require_service()

    rows = fetch(
        service.table("resources").select(
            "id, title, category, status, academic_year, professor_name, "
            "file_size, file_url, created_at, module_id, "
            "modules(title, code, semesters(name))"
        ).order("created_at", desc=True)
    )

    return [
        {
            "id": row["id"],
            "title": row["title"],
            "category": row["category"],
            "status": row["status"],
            "academic_year": row["academic_year"],
            "professor_name": row.get("professor_name"),
            "file_size": row.get("file_size"),
            "file_url": row["file_url"],
            "module_id": row["module_id"],
            "module_title": (row.get("modules") or {}).get("title"),
            "module_code": (row.get("modules") or {}).get("code"),
            "semester_name": (
                (row.get("modules") or {}).get("semesters") or {}
            ).get("name"),
            "created_at": row["created_at"],
        }
        for row in rows
    ]


@router.delete(
    f"{API_V1_PREFIX}/admin/resources/{{resource_id}}",
    summary="Delete a resource and its stored file",
)
async def delete_admin_resource(
    resource_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()
    row = _get_resource_or_404(service, resource_id)

    storage_path = row.get("file_url")
    deleted_files = _delete_storage_objects([storage_path] if storage_path else [])

    service.table("resources").delete().eq("id", str(resource_id)).execute()
    return {"id": str(resource_id), "deleted": True, "deleted_files": deleted_files}


# ---------------------------------------------------------------------------
# Timetable CRUD
# ---------------------------------------------------------------------------


class AdminTimetableOut(BaseModel):
    id: str
    semester_id: str
    semester_name: str | None
    academic_year: str
    file_url: str
    updated_at: datetime


@router.get(
    f"{API_V1_PREFIX}/admin/timetables",
    response_model=list[AdminTimetableOut],
    summary="List every timetable",
)
async def list_admin_timetables(admin=Depends(get_admin_user)) -> list[dict]:
    service = require_service()

    rows = fetch(
        service.table("timetables").select(
            "id, semester_id, academic_year, file_url, updated_at, "
            "semesters(name)"
        ).order("updated_at", desc=True)
    )

    return [
        {
            "id": row["id"],
            "semester_id": row["semester_id"],
            "semester_name": (row.get("semesters") or {}).get("name"),
            "academic_year": row["academic_year"],
            "file_url": row["file_url"],
            "updated_at": row["updated_at"],
        }
        for row in rows
    ]


@router.delete(
    f"{API_V1_PREFIX}/admin/timetables/{{timetable_id}}",
    summary="Delete a timetable and its stored file",
)
async def delete_admin_timetable(
    timetable_id: uuid.UUID, admin=Depends(get_admin_user)
) -> dict:
    service = require_service()

    row = get_single(service, "timetables", "id", str(timetable_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Emploi du temps introuvable.")

    storage_path = row.get("file_url")
    deleted_files = _delete_storage_objects([storage_path] if storage_path else [])

    service.table("timetables").delete().eq("id", str(timetable_id)).execute()
    return {
        "id": str(timetable_id),
        "deleted": True,
        "deleted_files": deleted_files,
    }
