import type {
  AcademicField,
  AcademicModule,
  Resource,
  ResourceCategory,
  Semester,
  Timetable,
} from '@/types'
import { apiFetch } from '@/api/client'

const FIELD_DESCRIPTIONS: Record<string, string> = {
  informatique:
    'Algorithmique, développement, réseaux, systèmes et bases de données.',
  'mathematiques-et-informatique':
    'Analyse, algèbre, probabilités, avec une solide base en informatique.',
}

interface FieldDto {
  id: string
  name: string
  slug: string
  description: string | null
  module_count: number
  resource_count: number
}

interface SemesterDto {
  id: string
  name: string
  slug: string
  field_slug: string
  field_name: string
}

interface ModuleDto {
  id: string
  title: string
  code: string
  description: string | null
  semester: {
    id: string
    name: string
    slug: string
    field: { id: string; name: string; slug: string }
  }
}

interface ResourceDto {
  id: string
  module_id: string
  title: string
  category: string
  file_url: string
  file_size: number | null
  academic_year: string
  professor_name: string | null
  created_at: string
}

interface TimetableDto {
  id: string
  semester_id: string
  file_url: string
  academic_year: string
  updated_at: string
}

function mapField(dto: FieldDto): AcademicField {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? FIELD_DESCRIPTIONS[dto.slug] ?? '',
    moduleCount: dto.module_count,
    resourceCount: dto.resource_count,
  }
}

function mapSemester(dto: SemesterDto): Semester {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    fieldSlug: dto.field_slug,
    fieldName: dto.field_name,
    moduleCount: 0,
  }
}

function mapModule(dto: ModuleDto): AcademicModule {
  return {
    id: dto.id,
    code: dto.code,
    title: dto.title,
    description: dto.description,
    semester: {
      id: dto.semester.id,
      name: dto.semester.name,
      slug: dto.semester.slug,
      fieldSlug: dto.semester.field.slug,
      fieldName: dto.semester.field.name,
    },
  }
}

function mapResource(dto: ResourceDto): Resource {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
    category: dto.category as ResourceCategory,
    moduleName: '',
    academicYear: dto.academic_year,
    professorName: dto.professor_name,
    fileSize: dto.file_size,
    fileUrl: dto.file_url,
    uploadedAt: dto.created_at,
  }
}

function mapTimetable(dto: TimetableDto): Timetable {
  return {
    id: dto.id,
    semesterId: dto.semester_id,
    fileUrl: dto.file_url,
    academicYear: dto.academic_year,
    updatedAt: dto.updated_at,
  }
}

export async function fetchFields(): Promise<AcademicField[]> {
  const dtos = await apiFetch<FieldDto[]>('/api/v1/fields')
  return dtos.map(mapField)
}

export async function fetchSemesters(fieldSlug: string): Promise<Semester[]> {
  const dtos = await apiFetch<SemesterDto[]>(
    `/api/v1/semesters/${encodeURIComponent(fieldSlug)}`,
  )
  return dtos.map(mapSemester)
}

export async function fetchModules(semesterId: string): Promise<AcademicModule[]> {
  const dtos = await apiFetch<ModuleDto[]>(
    `/api/v1/modules/${encodeURIComponent(semesterId)}`,
  )
  return dtos.map(mapModule)
}

export async function fetchModule(moduleId: string): Promise<AcademicModule> {
  const dto = await apiFetch<ModuleDto>(
    `/api/v1/module/${encodeURIComponent(moduleId)}`,
  )
  return mapModule(dto)
}

export async function fetchModuleResources(
  moduleId: string,
): Promise<Resource[]> {
  const dtos = await apiFetch<ResourceDto[]>(
    `/api/v1/resources/${encodeURIComponent(moduleId)}`,
  )
  return dtos.map(mapResource)
}

export async function fetchTimetable(semesterId: string): Promise<Timetable> {
  const dto = await apiFetch<TimetableDto>(
    `/api/v1/timetables/${encodeURIComponent(semesterId)}`,
  )
  return mapTimetable(dto)
}
