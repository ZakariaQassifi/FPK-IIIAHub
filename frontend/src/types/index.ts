export type ResourceCategory =
  | 'COURS'
  | 'TD'
  | 'TP'
  | 'SLIDES'
  | 'EXAMS'
  | 'CORRECTIONS'
  | 'RESUMES'
  | 'OTHERS'

export interface AcademicField {
  id: string
  name: string
  slug: string
  description: string
  moduleCount: number
  resourceCount: number
}

export interface Semester {
  id: string
  name: string
  slug: string
  fieldSlug: string
  fieldName: string
  moduleCount: number
}

export interface SemesterRef {
  id: string
  name: string
  slug: string
  fieldSlug: string
  fieldName: string
}

export interface AcademicModule {
  id: string
  code: string
  title: string
  description: string | null
  semester: SemesterRef
}

export interface Resource {
  id: string
  moduleId: string
  title: string
  category: ResourceCategory
  moduleName: string
  academicYear: string
  professorName: string | null
  fileSize: number | null
  fileUrl: string
  uploadedAt: string
}

export interface Timetable {
  id: string
  semesterId: string
  fileUrl: string
  academicYear: string
  updatedAt: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  category: string
  isPinned: boolean
  authorName: string | null
  publishedAt: string
  expiresAt: string | null
}

export type SubmissionStatus =
  | 'PENDING'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'

export interface Submission {
  id: string
  title: string
  category: ResourceCategory
  status: SubmissionStatus
  academicYear: string
  professorName: string | null
  fileSize: number | null
  fileUrl: string
  createdAt: string
  moduleName: string | null
  moduleCode: string | null
  semesterName: string | null
  fieldName: string | null
}

export interface SubmissionReceipt {
  id: string
  title: string
  status: SubmissionStatus
  createdAt: string
}

export interface AdminStats {
  totalResources: number
  pendingReviews: number
  totalStudents: number
}

export interface PendingResource {
  id: string
  title: string
  category: ResourceCategory
  status: SubmissionStatus
  academicYear: string
  professorName: string | null
  fileSize: number | null
  fileUrl: string
  createdAt: string
  moduleId: string
  moduleTitle: string | null
  moduleCode: string | null
  semesterName: string | null
  fieldName: string | null
  uploaderName: string | null
}
