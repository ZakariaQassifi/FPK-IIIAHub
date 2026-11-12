import { apiFetch } from '@/api/client'
import type {
  AdminModule,
  AdminResource,
  AdminTimetable,
  IIIAModule,
  IIIAResource,
  IIIASemester,
} from '@/types/iiia'

/* ------------------------------------------------------------------ */
/* Student facing: the academic hierarchy                             */
/* ------------------------------------------------------------------ */

interface SemesterDto {
  id: string
  name: string
  slug: string
  module_count: number
  resource_count: number
}

interface ModuleDto {
  id: string
  title: string
  code: string
  description: string | null
  semester_slug: string | null
  semester_name: string | null
  resource_count: number
  counts: Record<string, number>
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

function mapSemester(dto: SemesterDto): IIIASemester {
  return {
    id: dto.id,
    slug: dto.slug as IIIASemester['slug'],
    label: dto.name,
    level: dto.name.startsWith('MS') ? 'MASTER' : 'LICENCE',
    moduleCount: dto.module_count,
    resourceCount: dto.resource_count,
  }
}

function mapModule(dto: ModuleDto): IIIAModule {
  return {
    id: dto.id,
    title: dto.title,
    code: dto.code,
    description: dto.description,
    semesterSlug: dto.semester_slug ?? '',
    semesterName: dto.semester_name ?? '',
    resourceCount: dto.resource_count,
    counts: dto.counts ?? {},
  }
}

function mapResource(dto: ResourceDto): IIIAResource {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
    category: dto.category as IIIAResource['category'],
    academicYear: dto.academic_year,
    professorName: dto.professor_name,
    fileSize: dto.file_size,
    fileUrl: dto.file_url,
    uploadedAt: dto.created_at,
  }
}

export async function fetchIiiaSemesters(): Promise<IIIASemester[]> {
  const dtos = await apiFetch<SemesterDto[]>('/api/v1/iiia/semesters')
  return dtos.map(mapSemester)
}

export async function fetchIiiaModules(
  semesterSlug: string,
): Promise<IIIAModule[]> {
  const dtos = await apiFetch<ModuleDto[]>(
    `/api/v1/iiia/semesters/${encodeURIComponent(semesterSlug)}/modules`,
  )
  return dtos.map(mapModule)
}

export async function fetchModuleResources(
  moduleId: string,
): Promise<IIIAResource[]> {
  const dtos = await apiFetch<ResourceDto[]>(
    `/api/v1/modules/${encodeURIComponent(moduleId)}/resources`,
  )
  return dtos.map(mapResource)
}

export async function fetchResourceDownload(
  resourceId: string,
): Promise<string> {
  const dto = await apiFetch<{ url: string }>(
    `/api/v1/resources/${encodeURIComponent(resourceId)}/download`,
  )
  return dto.url
}

export async function fetchTimetableDownload(
  semesterId: string,
): Promise<{ url: string; filename: string }> {
  return apiFetch<{ url: string; filename: string }>(
    `/api/v1/timetables/${encodeURIComponent(semesterId)}/download`,
  )
}

/* ------------------------------------------------------------------ */
/* Admin: resources                                                    */
/* ------------------------------------------------------------------ */

interface AdminResourceDto {
  id: string
  title: string
  category: string
  status: string
  academic_year: string
  professor_name: string | null
  file_size: number | null
  file_url: string
  module_id: string
  module_title: string | null
  module_code: string | null
  semester_name: string | null
  created_at: string
}

function mapAdminResource(dto: AdminResourceDto): AdminResource {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category as AdminResource['category'],
    status: dto.status,
    academicYear: dto.academic_year,
    professorName: dto.professor_name,
    fileSize: dto.file_size,
    fileUrl: dto.file_url,
    moduleId: dto.module_id,
    moduleTitle: dto.module_title,
    moduleCode: dto.module_code,
    semesterName: dto.semester_name,
    createdAt: dto.created_at,
  }
}

export async function fetchAdminResources(
  token: string,
): Promise<AdminResource[]> {
  const dtos = await apiFetch<AdminResourceDto[]>('/api/v1/admin/resources', {
    token,
  })
  return dtos.map(mapAdminResource)
}

export async function deleteAdminResource(token: string, id: string) {
  await apiFetch(`/api/v1/admin/resources/${id}`, {
    method: 'DELETE',
    token,
  })
}

export interface AdminResourceUploadPayload {
  title: string
  category: string
  academicYear: string
  moduleId?: string
  moduleName?: string
  moduleCode?: string
  semesterId?: string
  professorName?: string
  file: File
}

export async function uploadAdminResource(
  token: string,
  payload: AdminResourceUploadPayload,
) {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('category', payload.category)
  formData.append('academic_year', payload.academicYear)
  if (payload.moduleId) formData.append('module_id', payload.moduleId)
  if (payload.moduleName) formData.append('module_name', payload.moduleName)
  if (payload.moduleCode) formData.append('module_code', payload.moduleCode)
  if (payload.semesterId) formData.append('semester_id', payload.semesterId)
  formData.append('professor_name', payload.professorName ?? '')
  formData.append('file', payload.file)

  await apiFetch('/api/v1/admin/resources/upload', {
    method: 'POST',
    token,
    body: formData,
  })
}

export async function updateAdminResource(
  token: string,
  id: string,
  patch: {
    title?: string
    category?: string
    academicYear?: string
    professorName?: string | null
  },
) {
  const body: Record<string, unknown> = {}
  if (patch.title !== undefined) body.title = patch.title
  if (patch.category !== undefined) body.category = patch.category
  if (patch.academicYear !== undefined) body.academic_year = patch.academicYear
  if (patch.professorName !== undefined) body.professor_name = patch.professorName

  await apiFetch(`/api/v1/admin/resources/${id}`, {
    method: 'PATCH',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/* ------------------------------------------------------------------ */
/* Admin: timetables                                                   */
/* ------------------------------------------------------------------ */

interface AdminTimetableDto {
  id: string
  semester_id: string
  semester_name: string | null
  academic_year: string
  file_url: string
  updated_at: string
}

function mapAdminTimetable(dto: AdminTimetableDto): AdminTimetable {
  return {
    id: dto.id,
    semesterId: dto.semester_id,
    semesterName: dto.semester_name,
    academicYear: dto.academic_year,
    fileUrl: dto.file_url,
    updatedAt: dto.updated_at,
  }
}

export async function fetchAdminTimetables(
  token: string,
): Promise<AdminTimetable[]> {
  const dtos = await apiFetch<AdminTimetableDto[]>('/api/v1/admin/timetables', {
    token,
  })
  return dtos.map(mapAdminTimetable)
}

export async function deleteAdminTimetable(token: string, id: string) {
  await apiFetch(`/api/v1/admin/timetables/${id}`, {
    method: 'DELETE',
    token,
  })
}

/* ------------------------------------------------------------------ */
/* Admin: modules                                                      */
/* ------------------------------------------------------------------ */

interface AdminModuleDto {
  id: string
  title: string
  code: string
  description: string | null
  semester_id: string
  semester_name: string | null
  semester_slug: string | null
  resource_count: number
}

function mapAdminModule(dto: AdminModuleDto): AdminModule {
  return {
    id: dto.id,
    title: dto.title,
    code: dto.code,
    description: dto.description,
    semesterId: dto.semester_id,
    semesterName: dto.semester_name,
    semesterSlug: dto.semester_slug,
    resourceCount: dto.resource_count,
  }
}

export async function fetchAdminModules(
  token: string,
  semesterId?: string,
): Promise<AdminModule[]> {
  const query = semesterId ? `?semester_id=${encodeURIComponent(semesterId)}` : ''
  const dtos = await apiFetch<AdminModuleDto[]>(
    `/api/v1/admin/modules${query}`,
    { token },
  )
  return dtos.map(mapAdminModule)
}

export interface AdminModuleCreatePayload {
  semesterId: string
  title: string
  code?: string
  description?: string | null
}

export async function createAdminModule(
  token: string,
  payload: AdminModuleCreatePayload,
): Promise<AdminModule> {
  const dto = await apiFetch<AdminModuleDto>('/api/v1/admin/modules', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      semester_id: payload.semesterId,
      title: payload.title,
      code: payload.code ?? '',
      description: payload.description ?? null,
    }),
  })
  return mapAdminModule(dto)
}

export async function updateAdminModule(
  token: string,
  id: string,
  patch: { title?: string; code?: string; description?: string | null },
): Promise<AdminModule> {
  const body: Record<string, unknown> = {}
  if (patch.title !== undefined) body.title = patch.title
  if (patch.code !== undefined) body.code = patch.code
  if (patch.description !== undefined) body.description = patch.description

  const dto = await apiFetch<AdminModuleDto>(
    `/api/v1/admin/modules/${id}`,
    {
      method: 'PATCH',
      token,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  return mapAdminModule(dto)
}

export interface AdminModuleDeleteResult {
  id: string
  deleted: boolean
  deleted_resources: number
  deleted_files?: number
}

export async function deleteAdminModule(
  token: string,
  id: string,
): Promise<AdminModuleDeleteResult> {
  return apiFetch<AdminModuleDeleteResult>(
    `/api/v1/admin/modules/${id}`,
    { method: 'DELETE', token },
  )
}
