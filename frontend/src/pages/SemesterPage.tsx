import { useCallback, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { CalendarIcon, ChevronLeftIcon, FileTextIcon } from '@/components/icons'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { ModuleCard } from '@/components/library/ModuleCard'
import { PdfPreviewModal } from '@/components/ui/PdfPreviewModal'
import { useIiiaModules, useIiiaSemesters } from '@/hooks/useLibrary'
import { fetchTimetableDownload } from '@/api/iiia'
import { useI18n } from '@/i18n'
import type { SemesterSlug } from '@/types/iiia'

export function SemesterPage() {
  const { semester } = useParams() as { semester?: SemesterSlug }
  const navigate = useNavigate()
  const { t } = useI18n()

  const semestersQuery = useIiiaSemesters()
  const semesters = semestersQuery.data ?? []
  const semesterInfo = semesters.find((s) => s.slug === semester) ?? null

  const modulesQuery = useIiiaModules(semester)
  const modules = modulesQuery.data ?? []

  const [timetableOpen, setTimetableOpen] = useState(false)

  const loadTimetableUrl = useCallback(async () => {
    if (!semesterInfo) throw new Error('Semestre introuvable.')
    const result = await fetchTimetableDownload(semesterInfo.id)
    return result.url
  }, [semesterInfo])

  if (semester && !semesterInfo && !semestersQuery.loading) {
    navigate('/library', { replace: true })
    return null
  }

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Link
          to="/library"
          onClick={(e) => {
            e.preventDefault()
            navigate('/library')
          }}
          className="mb-10 inline-flex items-center gap-3 rounded-xl border border-apple-border bg-apple-bg px-5 py-3 text-sm font-semibold text-apple-text-secondary shadow-sm transition-all duration-200 hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {t('semester.back')}
        </Link>

        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-3">
            {semesterInfo && (
              <Badge
                variant={
                  semesterInfo.level === 'LICENCE' ? 'licence' : 'master'
                }
              >
                {semesterInfo.level === 'LICENCE'
                  ? t('semester.licence')
                  : t('semester.master')}
              </Badge>
            )}
            <h1 className="text-4xl font-bold tracking-tight text-apple-text-primary">
              {semester
                ? t('semester.title', { semester: semester.toUpperCase() })
                : t('semester.title', { semester: '…' })}
            </h1>
          </div>
          <Separator label={t('semester.modulesSeparator')} />
        </div>

        <p className="mb-12 max-w-3xl text-xl text-apple-text-secondary">
          {t('semester.modulesDescription')}
        </p>

        {/* Timetable */}
        {semesterInfo && (
          <div className="mb-12 rounded-2xl border border-apple-border bg-apple-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-apple-blue-light text-apple-text-primary">
                  <CalendarIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-apple-text-primary">
                    {t('semester.timetableTitle')}
                  </h3>
                  <p className="mt-1 text-xs text-apple-text-secondary">
                    {t('semester.timetableDescription')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTimetableOpen(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-apple-border bg-apple-card px-4 py-2.5 text-xs font-semibold text-apple-text-primary transition-all duration-200 hover:border-signal-light hover:bg-signal-light"
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                {t('semester.timetablePreview')}
              </button>
            </div>
          </div>
        )}

        {modulesQuery.loading ? (
          <div className="grid gap-5">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-apple-blue-light/40"
              />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-apple-border bg-apple-card p-14 text-center">
            <p className="text-sm font-medium text-apple-text-secondary">
              {t('semester.noModules')}
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                to={`/library/${semester}/${module.id}`}
              />
            ))}
          </div>
        )}
      </div>

      {semesterInfo && (
        <PdfPreviewModal
          open={timetableOpen}
          onClose={() => setTimetableOpen(false)}
          title={`${t('semester.timetableTitle')} — ${semesterInfo.label}`}
          semesterLabel={semesterInfo.label}
          categoryLabel={t('semester.timetableCategory')}
          loadUrl={loadTimetableUrl}
        />
      )}
    </div>
  )
}
