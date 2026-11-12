import { apiFetch } from '@/api/client'

export interface ContributionPayload {
  title: string
  semesterId: string
  moduleId: string
  category: string
  academicYear: string
  contributorName: string
  contributorEmail: string
  file: File
}

export interface ContributionCreated {
  id: string
  title: string
  category: string
  status: string
  semesterName: string | null
  moduleCode: string | null
  createdAt: string
}

export async function submitContribution(
  payload: ContributionPayload,
): Promise<ContributionCreated> {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('semester_id', payload.semesterId)
  formData.append('module_id', payload.moduleId)
  formData.append('category', payload.category)
  formData.append('academic_year', payload.academicYear)
  formData.append('contributor_name', payload.contributorName)
  formData.append('contributor_email', payload.contributorEmail)
  formData.append('file', payload.file)

  const dto = await apiFetch<{
    id: string
    title: string
    category: string
    status: string
    semester_name: string | null
    module_code: string | null
    created_at: string
  }>('/api/v1/contributions', {
    method: 'POST',
    body: formData,
  })

  return {
    id: dto.id,
    title: dto.title,
    category: dto.category,
    status: dto.status,
    semesterName: dto.semester_name,
    moduleCode: dto.module_code,
    createdAt: dto.created_at,
  }
}
