export type SemesterSlug =
  | 'S1'
  | 'S2'
  | 'S3'
  | 'S4'
  | 'S5'
  | 'S6'
  | 'MS1'
  | 'MS2'
  | 'MS3'
  | 'MS4'

/** Categories exposed to students, grouped into four library sections. */
export type LibraryCategory = 'COURS' | 'TD_TP' | 'EXAMS' | 'OTHERS'

/** Categories stored in the database. TD and TP are grouped under TD_TP. */
export type ResourceCategory =
  | 'COURS'
  | 'TD'
  | 'TP'
  | 'SLIDES'
  | 'EXAMS'
  | 'CORRECTIONS'
  | 'RESUMES'
  | 'OTHERS'

export interface IIIASemester {
  id: string
  slug: SemesterSlug
  label: string
  level: 'LICENCE' | 'MASTER'
  moduleCount: number
  resourceCount: number
}

export interface IIIAModule {
  id: string
  title: string
  code: string
  description: string | null
  semesterSlug: string
  semesterName: string
  resourceCount: number
  counts: Record<string, number>
}

export interface IIIAResource {
  id: string
  moduleId: string
  title: string
  category: ResourceCategory
  academicYear: string
  professorName: string | null
  fileSize: number | null
  fileUrl: string
  uploadedAt: string
}

export interface IIIAAnnouncement {
  id: string
  title: string
  content: string
  category: 'EXAMEN' | 'ADMINISTRATIF' | 'PEDAGOGIQUE'
  isPinned: boolean
  authorName: string | null
  publishedAt: string
  expiresAt: string | null
}

export interface AdminResource {
  id: string
  title: string
  category: ResourceCategory
  status: string
  academicYear: string
  professorName: string | null
  fileSize: number | null
  fileUrl: string
  moduleId: string
  moduleTitle: string | null
  moduleCode: string | null
  semesterName: string | null
  createdAt: string
}

export interface AdminTimetable {
  id: string
  semesterId: string
  semesterName: string | null
  academicYear: string
  fileUrl: string
  updatedAt: string
}

export interface AdminModule {
  id: string
  title: string
  code: string
  description: string | null
  semesterId: string
  semesterName: string | null
  semesterSlug: string | null
  resourceCount: number
}
