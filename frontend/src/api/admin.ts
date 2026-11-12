import type {
  AdminStats,
  Announcement,
  PendingResource,
  ResourceCategory,
  SubmissionStatus,
} from '@/types'
import { apiFetch } from '@/api/client'

interface AdminStatsDto {
  total_resources: number
  pending_reviews: number
  total_students: number
}

interface PendingResourceDto {
  id: string
  title: string
  category: string
  status: string
  academic_year: string
  professor_name: string | null
  file_size: number | null
  file_url: string
  created_at: string
  module_id: string
  module_title: string | null
  module_code: string | null
  semester_name: string | null
  field_name: string | null
  uploader_name: string | null
}

interface AnnouncementDto {
  id: string
  title: string
  content: string
  category: string
  is_pinned: boolean
  created_at: string
  expires_at: string | null
}

function mapPending(dto: PendingResourceDto): PendingResource {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category as ResourceCategory,
    status: dto.status as SubmissionStatus,
    academicYear: dto.academic_year,
    professorName: dto.professor_name,
    fileSize: dto.file_size,
    fileUrl: dto.file_url,
    createdAt: dto.created_at,
    moduleId: dto.module_id,
    moduleTitle: dto.module_title,
    moduleCode: dto.module_code,
    semesterName: dto.semester_name,
    fieldName: dto.field_name,
    uploaderName: dto.uploader_name,
  }
}

function mapAnnouncement(dto: AnnouncementDto): Announcement {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    category: dto.category,
    isPinned: dto.is_pinned,
    authorName: null,
    publishedAt: dto.created_at,
    expiresAt: dto.expires_at,
  }
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const dto = await apiFetch<AdminStatsDto>('/api/v1/admin/stats', { token })
  return {
    totalResources: dto.total_resources,
    pendingReviews: dto.pending_reviews,
    totalStudents: dto.total_students,
  }
}

export async function fetchPendingResources(
  token: string,
): Promise<PendingResource[]> {
  const dtos = await apiFetch<PendingResourceDto[]>(
    '/api/v1/admin/pending-resources',
    { token },
  )
  return dtos.map(mapPending)
}

export async function approveResource(token: string, id: string) {
  await apiFetch(`/api/v1/admin/resources/${id}/approve`, {
    method: 'PATCH',
    token,
  })
}

export async function rejectResource(token: string, id: string) {
  await apiFetch(`/api/v1/admin/resources/${id}/reject`, {
    method: 'PATCH',
    token,
  })
}

export async function updateResourceMetadata(
  token: string,
  id: string,
  patch: {
    title?: string
    category?: ResourceCategory
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

export async function fetchResourceSignedUrl(
  token: string,
  id: string,
): Promise<string> {
  const dto = await apiFetch<{ url: string }>(
    `/api/v1/admin/resources/${id}/signed-url`,
    { token },
  )
  return dto.url
}

export async function uploadTimetable(
  token: string,
  payload: { semesterId: string; academicYear: string; file: File },
) {
  const formData = new FormData()
  formData.append('semester_id', payload.semesterId)
  formData.append('academic_year', payload.academicYear)
  formData.append('file', payload.file)

  await apiFetch('/api/v1/admin/timetables', {
    method: 'POST',
    token,
    body: formData,
  })
}

export interface AdminResourceUploadPayload {
  title: string
  moduleId: string
  category: string
  academicYear: string
  professorName: string
  file: File
}

export async function uploadResource(
  token: string,
  payload: AdminResourceUploadPayload,
) {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('module_id', payload.moduleId)
  formData.append('category', payload.category)
  formData.append('academic_year', payload.academicYear)
  formData.append('professor_name', payload.professorName)
  formData.append('file', payload.file)

  await apiFetch('/api/v1/admin/resources/upload', {
    method: 'POST',
    token,
    body: formData,
  })
}

export async function fetchAdminAnnouncements(
  token: string,
): Promise<Announcement[]> {
  const dtos = await apiFetch<AnnouncementDto[]>('/api/v1/admin/announcements', {
    token,
  })
  return dtos.map(mapAnnouncement)
}

/* ------------------------------------------------------------------ */
/* Admin: moderation queue for student contributions                   */
/* ------------------------------------------------------------------ */

export interface PendingSubmission {
  id: string
  title: string
  category: string
  academicYear: string
  fileUrl: string
  fileSize: number | null
  fileType: string | null
  contributorName: string | null
  contributorEmail: string | null
  semesterId: string | null
  semesterName: string | null
  moduleId: string | null
  moduleTitle: string | null
  moduleCode: string | null
  createdAt: string
}

interface PendingSubmissionDto {
  id: string
  title: string
  category: string
  academic_year: string
  file_url: string
  file_size: number | null
  file_type: string | null
  contributor_name: string | null
  contributor_email: string | null
  semester_id: string | null
  semester_name: string | null
  module_id: string | null
  module_title: string | null
  module_code: string | null
  created_at: string
}

function mapPendingSubmission(dto: PendingSubmissionDto): PendingSubmission {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category,
    academicYear: dto.academic_year,
    fileUrl: dto.file_url,
    fileSize: dto.file_size,
    fileType: dto.file_type,
    contributorName: dto.contributor_name,
    contributorEmail: dto.contributor_email,
    semesterId: dto.semester_id,
    semesterName: dto.semester_name,
    moduleId: dto.module_id,
    moduleTitle: dto.module_title,
    moduleCode: dto.module_code,
    createdAt: dto.created_at,
  }
}

export async function fetchPendingSubmissions(
  token: string,
): Promise<PendingSubmission[]> {
  const dtos = await apiFetch<PendingSubmissionDto[]>(
    '/api/v1/admin/pending-submissions',
    { token },
  )
  return dtos.map(mapPendingSubmission)
}

export async function fetchPendingSubmissionSignedUrl(
  token: string,
  id: string,
): Promise<string> {
  const dto = await apiFetch<{ url: string }>(
    `/api/v1/admin/pending-submissions/${id}/signed-url`,
    { token },
  )
  return dto.url
}

export async function approvePendingSubmission(token: string, id: string) {
  await apiFetch(`/api/v1/admin/pending-submissions/${id}/approve`, {
    method: 'POST',
    token,
  })
}

export async function rejectPendingSubmission(token: string, id: string) {
  await apiFetch(`/api/v1/admin/pending-submissions/${id}`, {
    method: 'DELETE',
    token,
  })
}

export interface AnnouncementPayload {
  title: string
  content: string
  category: string
  isPinned: boolean
  expiresAt: string | null
}

/** Update payload: every field is optional and the expiry can be cleared. */
export interface AnnouncementUpdatePayload {
  title?: string
  content?: string
  category?: string
  isPinned?: boolean
  expiresAt?: string | null
  clearExpiry?: boolean
}

export async function createAnnouncement(
  token: string,
  payload: AnnouncementPayload,
): Promise<Announcement> {
  const dto = await apiFetch<AnnouncementDto>('/api/v1/admin/announcements', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      category: payload.category,
      is_pinned: payload.isPinned,
      expires_at: payload.expiresAt,
    }),
  })
  return mapAnnouncement(dto)
}

export async function updateAnnouncement(
  token: string,
  id: string,
  payload: AnnouncementUpdatePayload,
) {
  const body: Record<string, unknown> = {}
  if (payload.title !== undefined) body.title = payload.title
  if (payload.content !== undefined) body.content = payload.content
  if (payload.category !== undefined) body.category = payload.category
  if (payload.isPinned !== undefined) body.is_pinned = payload.isPinned
  if (payload.expiresAt !== undefined) body.expires_at = payload.expiresAt
  if (payload.clearExpiry) body.clear_expiry = true

  await apiFetch(`/api/v1/admin/announcements/${id}`, {
    method: 'PATCH',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function deleteAnnouncement(token: string, id: string) {
  await apiFetch(`/api/v1/admin/announcements/${id}`, {
    method: 'DELETE',
    token,
  })
}
