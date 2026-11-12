from datetime import datetime

from pydantic import BaseModel


class AcademicFieldOut(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    module_count: int
    resource_count: int


class AcademicFieldRef(BaseModel):
    id: str
    name: str
    slug: str


class SemesterRef(BaseModel):
    id: str
    name: str
    slug: str
    field: AcademicFieldRef


class SemesterOut(BaseModel):
    id: str
    name: str
    slug: str
    field_slug: str
    field_name: str


class AcademicModuleOut(BaseModel):
    id: str
    title: str
    code: str
    description: str | None
    semester: SemesterRef


class ResourceOut(BaseModel):
    id: str
    module_id: str
    title: str
    category: str
    file_url: str
    file_size: int | None
    academic_year: str
    professor_name: str | None
    created_at: datetime


class TimetableOut(BaseModel):
    id: str
    semester_id: str
    file_url: str
    academic_year: str
    updated_at: datetime
