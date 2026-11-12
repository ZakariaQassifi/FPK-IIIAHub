import { useNavigate } from 'react-router-dom'
import { SemesterGrid } from '@/components/library/SemesterGrid'
import { useIiiaSemesters } from '@/hooks/useLibrary'
import { useI18n } from '@/i18n'

export function LibraryPage() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const semestersQuery = useIiiaSemesters()
  const semesters = semestersQuery.data ?? []

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-12 flex flex-col gap-3">
          <span className="inline-flex w-fit items-center rounded-full border border-signal-light bg-signal-light px-4 py-2 text-xs font-semibold uppercase tracking-wider text-apple-text-primary">
            {t('library.badge')}
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-apple-text-primary">
            {t('library.title')}
          </h1>
        </div>

        <p className="mb-14 max-w-3xl text-xl text-apple-text-secondary">
          {t('library.description')}
        </p>

        {semestersQuery.loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl bg-apple-blue-light/40"
              />
            ))}
          </div>
        ) : (
          <SemesterGrid
            semesters={semesters}
            onSemesterClick={(slug) => navigate(`/library/${slug}`)}
          />
        )}
      </div>
    </div>
  )
}
