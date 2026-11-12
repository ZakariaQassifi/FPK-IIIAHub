import type { IIIASemester } from '@/types/iiia'
import { SemesterCard } from './SemesterCard'

interface SemesterGridProps {
  semesters: IIIASemester[]
  onSemesterClick: (slug: string) => void
}

export function SemesterGrid({
  semesters,
  onSemesterClick,
}: SemesterGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {semesters.map((semester) => (
        <SemesterCard
          key={semester.slug}
          label={semester.label}
          level={semester.level}
          resourceCount={semester.resourceCount}
          onClick={() => onSemesterClick(semester.slug)}
        />
      ))}
    </div>
  )
}
