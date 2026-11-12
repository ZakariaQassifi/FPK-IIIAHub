import type { ResourceCategory, Submission, SubmissionReceipt, SubmissionStatus } from '@/types'
import { apiFetch } from '@/api/client'

interface SubmissionReceiptDto {
  id: string
  title: string
  status: string
  created_at: string
}

interface SubmissionDto {
  id: string
  title: string
  category: string
  status: string
  academic_year: string
  professor_name: string | null
  file_size: number | null
  file_url: string
  created_at: string
  module_title: string | null
  module_code: string | null
  semester_name: string | null
  field_name: string | null
}

export async function submitResource(
  formData: FormData,
  token: string,
): Promise<SubmissionReceipt> {
  const dto = await apiFetch<SubmissionReceiptDto>('/api/v1/resources/submit', {
    method: 'POST',
    token,
    body: formData,
  })
  return {
    id: dto.id,
    title: dto.title,
    status: dto.status as SubmissionStatus,
    createdAt: dto.created_at,
  }
}

export async function fetchMySubmissions(token: string): Promise<Submission[]> {
  const dtos = await apiFetch<SubmissionDto[]>('/api/v1/resources/mine', { token })
  return dtos.map((dto) => ({
    id: dto.id,
    title: dto.title,
    category: dto.category as ResourceCategory,
    status: dto.status as SubmissionStatus,
    academicYear: dto.academic_year,
    professorName: dto.professor_name,
    fileSize: dto.file_size,
    fileUrl: dto.file_url,
    createdAt: dto.created_at,
    moduleName: dto.module_title,
    moduleCode: dto.module_code,
    semesterName: dto.semester_name,
    fieldName: dto.field_name,
  }))
}
