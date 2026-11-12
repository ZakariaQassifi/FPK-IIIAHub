import uuid
from collections import Counter

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.routers.common import (
    build_storage_url,
    db_error,
    fetch,
    get_single,
    require_service,
    require_supabase,
)
from app.routers.submissions import RESOURCES_BUCKET
from app.schemas import (
    AcademicFieldOut,
    AcademicModuleOut,
    ResourceOut,
    SemesterOut,
    TimetableOut,
)

router = APIRouter(tags=["catalog"])

API_V1_PREFIX = "/api/v1"


@router.get(
    f"{API_V1_PREFIX}/fields",
    response_model=list[AcademicFieldOut],
    summary="List all academic fields with module and resource counts",
)
async def list_fields() -> list[dict]:
    client = require_supabase()

    fields = fetch(
        client.table("academic_fields").select("id, name, slug").order("name")
    )
    semesters = fetch(
        client.table("semesters").select("id, academic_field_id")
    )
    modules = fetch(client.table("modules").select("id, semester_id"))
    resources = fetch(client.table("resources").select("id, module_id"))

    semester_field = {
        row["id"]: row["academic_field_id"] for row in semesters
    }
    module_field = {
        row["id"]: semester_field[row["semester_id"]]
        for row in modules
        if row["semester_id"] in semester_field
    }
    module_counts = Counter(module_field.values())
    resource_counts = Counter(
        module_field[row["module_id"]]
        for row in resources
        if row["module_id"] in module_field
    )

    return [
        {
            "id": field["id"],
            "name": field["name"],
            "slug": field["slug"],
            "description": None,
            "module_count": module_counts.get(field["id"], 0),
            "resource_count": resource_counts.get(field["id"], 0),
        }
        for field in fields
    ]


@router.get(
    f"{API_V1_PREFIX}/semesters/{{field_slug}}",
    response_model=list[SemesterOut],
    summary="List semesters for an academic field",
)
async def list_semesters(field_slug: str) -> list[dict]:
    client = require_supabase()

    field = get_single(client, "academic_fields", "slug", field_slug)
    if field is None:
        raise HTTPException(
            status_code=404, detail=f"Academic field '{field_slug}' not found."
        )

    rows = fetch(
        client.table("semesters")
        .select("id, name, slug")
        .eq("academic_field_id", field["id"])
        .order("name")
    )
    return [
        {
            "id": row["id"],
            "name": row["name"],
            "slug": row["slug"],
            "field_slug": field["slug"],
            "field_name": field["name"],
        }
        for row in rows
    ]


def map_module_row(semester: dict, field: dict, row: dict) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "code": row["code"],
        "description": row.get("description"),
        "semester": {
            "id": semester["id"],
            "name": semester["name"],
            "slug": semester["slug"],
            "field": {
                "id": field["id"],
                "name": field["name"],
                "slug": field["slug"],
            },
        },
    }


@router.get(
    f"{API_V1_PREFIX}/modules/{{semester_id}}",
    response_model=list[AcademicModuleOut],
    summary="List modules for a semester",
)
async def list_modules(semester_id: uuid.UUID) -> list[dict]:
    client = require_supabase()

    semester = get_single(client, "semesters", "id", str(semester_id))
    if semester is None:
        raise HTTPException(status_code=404, detail="Semester not found.")

    field = get_single(client, "academic_fields", "id", semester["academic_field_id"])
    if field is None:
        raise HTTPException(status_code=404, detail="Academic field not found.")

    rows = fetch(
        client.table("modules")
        .select("id, title, code, description")
        .eq("semester_id", str(semester_id))
        .order("code")
    )
    return [map_module_row(semester, field, row) for row in rows]


@router.get(
    f"{API_V1_PREFIX}/module/{{module_id}}",
    response_model=AcademicModuleOut,
    summary="Get a single module with its semester and field",
)
async def get_module(module_id: uuid.UUID) -> dict:
    client = require_supabase()

    module = get_single(client, "modules", "id", str(module_id))
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found.")

    semester = get_single(client, "semesters", "id", module["semester_id"])
    if semester is None:
        raise HTTPException(status_code=404, detail="Semester not found.")

    field = get_single(client, "academic_fields", "id", semester["academic_field_id"])
    if field is None:
        raise HTTPException(status_code=404, detail="Academic field not found.")

    return map_module_row(semester, field, module)


@router.get(
    f"{API_V1_PREFIX}/resources/{{module_id}}",
    response_model=list[ResourceOut],
    summary="List approved resources for a module",
)
async def list_resources(module_id: uuid.UUID) -> list[dict]:
    client = require_supabase()

    module = get_single(client, "modules", "id", str(module_id))
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found.")

    return fetch(
        client.table("resources")
        .select(
            "id, module_id, title, category, file_url, file_size, "
            "academic_year, professor_name, created_at"
        )
        .eq("module_id", str(module_id))
        .eq("status", "APPROVED")
        .order("created_at", desc=True)
    )


@router.get(
    f"{API_V1_PREFIX}/timetables/{{semester_id}}",
    response_model=TimetableOut,
    summary="Get the latest timetable for a semester",
)
async def get_timetable(semester_id: uuid.UUID) -> dict:
    client = require_supabase()

    semester = get_single(client, "semesters", "id", str(semester_id))
    if semester is None:
        raise HTTPException(status_code=404, detail="Semester not found.")

    rows = fetch(
        client.table("timetables")
        .select("id, semester_id, file_url, academic_year, updated_at")
        .eq("semester_id", str(semester_id))
        .order("updated_at", desc=True)
        .limit(1)
    )
    if not rows:
        raise HTTPException(
            status_code=404, detail="No timetable for this semester yet."
        )
    return rows[0]


class StudentDownloadOut(BaseModel):
    url: str
    expires_in: int
    filename: str


@router.get(
    f"{API_V1_PREFIX}/timetables/{{semester_id}}/download",
    response_model=StudentDownloadOut,
    summary="Get a temporary download URL for a semester timetable",
)
async def download_timetable(semester_id: uuid.UUID) -> dict:
    client = require_supabase()

    semester = get_single(client, "semesters", "id", str(semester_id))
    if semester is None:
        raise HTTPException(status_code=404, detail="Semester not found.")

    rows = fetch(
        client.table("timetables")
        .select("id, file_url")
        .eq("semester_id", str(semester_id))
        .order("updated_at", desc=True)
        .limit(1)
    )
    if not rows:
        raise HTTPException(
            status_code=404, detail="No timetable for this semester yet."
        )

    storage_path = rows[0].get("file_url")
    if not storage_path:
        raise HTTPException(status_code=404, detail="Timetable file not found.")

    service = require_service()
    try:
        result = service.storage.from_(RESOURCES_BUCKET).create_signed_url(
            storage_path, 3600
        )
    except Exception as exc:
        raise db_error(
            f"Unable to sign '{storage_path}' in bucket '{RESOURCES_BUCKET}'",
            exc,
        ) from exc

    signed = (
        result.get("signedURL")
        if isinstance(result, dict)
        else getattr(result, "signed_url", None)
    )
    if not signed:
        raise HTTPException(
            status_code=502, detail="Download link unavailable."
        )

    return {
        "url": build_storage_url(signed),
        "expires_in": 3600,
        "filename": storage_path.rsplit("/", 1)[-1],
    }


# ---------------------------------------------------------------------------
# IIIA library hierarchy (public, student facing)
# ---------------------------------------------------------------------------


IIIA_FIELD_SLUG = "genie-informatique-ia"


class StudentModuleOut(BaseModel):
    id: str
    title: str
    code: str
    description: str | None
    semester_slug: str | None
    semester_name: str | None
    resource_count: int = 0
    counts: dict[str, int] = {}


def _iiia_field_id(client) -> str:
    field = get_single(client, "academic_fields", "slug", IIIA_FIELD_SLUG)
    if field is None:
        raise HTTPException(
            status_code=404,
            detail="The IIIA academic field is not configured.",
        )
    return field["id"]


@router.get(
    f"{API_V1_PREFIX}/iiia/semesters",
    summary="List IIIA semesters with module and resource counts",
)
async def list_iiia_semesters() -> list[dict]:
    client = require_supabase()
    field_id = _iiia_field_id(client)

    semesters = fetch(
        client.table("semesters")
        .select("id, name, slug")
        .eq("academic_field_id", field_id)
        .order("name")
    )
    if not semesters:
        return []

    semester_ids = [row["id"] for row in semesters]
    modules = fetch(
        client.table("modules").select("id, semester_id").in_("semester_id", semester_ids)
    )
    resources = fetch(
        client.table("resources")
        .select("module_id, status")
        .eq("status", "APPROVED")
        .in_(
            "module_id",
            [row["id"] for row in modules] or ["00000000-0000-0000-0000-000000000000"],
        )
    )

    modules_by_semester: dict[str, list[str]] = {}
    for module in modules:
        modules_by_semester.setdefault(module["semester_id"], []).append(
            module["id"]
        )

    resources_by_module: dict[str, int] = {}
    for resource in resources:
        resources_by_module[resource["module_id"]] = (
            resources_by_module.get(resource["module_id"], 0) + 1
        )

    def sort_key(row: dict) -> tuple[int, int]:
        name = row["name"]
        if name.startswith("MS"):
            return 1, int(name[2:])
        return 0, int(name[1:])

    result = []
    for semester in sorted(semesters, key=sort_key):
        module_ids = modules_by_semester.get(semester["id"], [])
        resource_count = sum(
            resources_by_module.get(module_id, 0) for module_id in module_ids
        )
        result.append(
            {
                "id": semester["id"],
                "name": semester["name"],
                "slug": semester["slug"],
                "module_count": len(module_ids),
                "resource_count": resource_count,
            }
        )
    return result


@router.get(
    f"{API_V1_PREFIX}/iiia/semesters/{{semester_slug}}/modules",
    summary="List the modules of an IIIA semester",
)
async def list_iiia_semester_modules(semester_slug: str) -> list[dict]:
    client = require_supabase()
    field_id = _iiia_field_id(client)

    # A semester slug is unique per academic field, never globally: the
    # lookup must therefore filter on both the field and the slug.
    semester_rows = fetch(
        client.table("semesters")
        .select("id, name, slug")
        .eq("academic_field_id", field_id)
        .eq("slug", semester_slug)
        .limit(1)
    )
    if not semester_rows:
        raise HTTPException(status_code=404, detail="Semester not found.")
    semester = semester_rows[0]

    modules = fetch(
        client.table("modules")
        .select("id, title, code, description")
        .eq("semester_id", semester["id"])
        .order("code")
    )
    if not modules:
        return []

    resources = fetch(
        client.table("resources")
        .select("module_id, category, status")
        .eq("status", "APPROVED")
        .in_(
            "module_id",
            [row["id"] for row in modules],
        )
    )

    counts_by_module: dict[str, dict[str, int]] = {}
    for resource in resources:
        bucket = counts_by_module.setdefault(resource["module_id"], {})
        bucket[resource["category"]] = bucket.get(resource["category"], 0) + 1

    return [
        {
            "id": module["id"],
            "title": module["title"],
            "code": module["code"],
            "description": module.get("description"),
            "semester_slug": semester["slug"],
            "semester_name": semester["name"],
            "resource_count": sum(counts_by_module.get(module["id"], {}).values()),
            "counts": counts_by_module.get(module["id"], {}),
        }
        for module in modules
    ]


@router.get(
    f"{API_V1_PREFIX}/modules/{{module_id}}/resources",
    summary="List the approved resources of a module grouped by category",
)
async def list_module_resources(module_id: uuid.UUID) -> list[dict]:
    client = require_supabase()

    module = get_single(client, "modules", "id", str(module_id))
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found.")

    return fetch(
        client.table("resources")
        .select(
            "id, module_id, title, category, file_url, file_size, "
            "academic_year, professor_name, created_at"
        )
        .eq("module_id", str(module_id))
        .eq("status", "APPROVED")
        .order("created_at", desc=True)
    )


@router.get(
    f"{API_V1_PREFIX}/resources/{{resource_id}}/download",
    response_model=StudentDownloadOut,
    summary="Get a temporary download URL for an approved resource",
)
async def download_resource(resource_id: uuid.UUID) -> dict:
    client = require_supabase()

    resource = get_single(client, "resources", "id", str(resource_id))
    if resource is None or resource.get("status") != "APPROVED":
        raise HTTPException(status_code=404, detail="Resource not found.")

    storage_path = resource.get("file_url")
    if not storage_path:
        raise HTTPException(status_code=404, detail="Resource file not found.")

    service = require_service()

    try:
        result = service.storage.from_(RESOURCES_BUCKET).create_signed_url(
            storage_path, 3600
        )
    except Exception as exc:
        raise db_error(
            f"Unable to sign '{storage_path}' in bucket '{RESOURCES_BUCKET}'",
            exc,
        ) from exc

    signed = (
        result.get("signedURL")
        if isinstance(result, dict)
        else getattr(result, "signed_url", None)
    )
    if not signed:
        raise HTTPException(
            status_code=502, detail="Download link unavailable."
        )

    filename = storage_path.rsplit("/", 1)[-1]
    return {
        "url": build_storage_url(signed),
        "expires_in": 3600,
        "filename": filename,
    }
