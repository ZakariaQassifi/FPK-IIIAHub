import { Link } from 'react-router-dom'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CardSkeleton, MockBadge, NotFoundMessage } from '@/components/feedback'
import { StatusBadge } from '@/components/StatusBadge'
import { CATEGORY_BADGES } from '@/lib/categories'
import { CalendarIcon, FileTextIcon, UploadIcon } from '@/components/icons'
import { useAuth } from '@/hooks/useAuth'
import { useMySubmissions } from '@/hooks/useSubmissions'

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate))
}

function formatFileSize(bytes: number | null) {
  if (bytes == null) return null
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function MySubmissionsPage() {
  const { session } = useAuth()
  const { data: submissions, loading, isMock, error } = useMySubmissions(
    session?.access_token,
  )

  const sorted = (submissions ?? [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const counts = {
    pendingReview: sorted.filter((s) => s.status === 'PENDING_REVIEW' || s.status === 'PENDING').length,
    approved: sorted.filter((s) => s.status === 'APPROVED').length,
    rejected: sorted.filter((s) => s.status === 'REJECTED').length,
  }

  return (
    <section className="bg-apple-bg py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Accueil', to: '/' },
            { label: 'Mes soumissions' },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-apple-text-primary sm:text-3xl">
              Mes soumissions
            </h1>
            <p className="mt-1.5 text-sm text-apple-text-secondary">
              Suivez l'état de validation de vos documents.
            </p>
          </div>
          {isMock && <MockBadge />}
        </div>

        {!loading && !error && sorted.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatCard label="En validation" value={counts.pendingReview} tone="indigo" />
            <StatCard label="Validés" value={counts.approved} tone="emerald" />
            <StatCard label="Rejetés" value={counts.rejected} tone="rose" />
          </div>
        )}

        {loading && (
          <div className="mt-8 space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-8">
            <NotFoundMessage
              title="Impossible de charger vos soumissions"
              description={error}
            />
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="mt-8">
            <div className="rounded-2xl border border-dashed border-apple-border bg-accent-soft p-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <UploadIcon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-base font-semibold text-apple-text-primary">
                Aucune soumission pour le moment
              </p>
              <p className="mt-2 text-sm text-apple-text-muted">
                Partagez votre premier document avec la communauté FPK.
              </p>
              <Link
                to="/contribute"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-signal-light px-5 py-2.5 text-sm font-semibold text-apple-text-primary shadow-md shadow-black/25 transition-all hover:brightness-95"
              >
                <UploadIcon className="h-4 w-4" />
                Proposer un document
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <ul className="mt-6 space-y-3">
            {sorted.map((submission) => {
              const badge = CATEGORY_BADGES[submission.category]
              const size = formatFileSize(submission.fileSize)
              return (
                <li
                  key={submission.id}
                  className="flex flex-col gap-4 rounded-2xl border border-apple-border bg-apple-card p-5 shadow-sm sm:flex-row sm:items-center sm:gap-5"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${badge.iconClasses}`}
                  >
                    <FileTextIcon className="h-5.5 w-5.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-apple-text-secondary">
                        {submission.academicYear}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-sm font-semibold text-apple-text-primary">
                      {submission.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-apple-text-muted">
                      {submission.moduleCode && submission.moduleName && (
                        <span>
                          {submission.moduleCode} — {submission.moduleName}
                          {submission.semesterName && ` · ${submission.semesterName}`}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        Soumis le {formatDate(submission.createdAt)}
                        {size && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{size}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={submission.status} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'indigo' | 'emerald' | 'rose'
}) {
  const tones = {
    indigo: 'text-accent',
    emerald: 'text-accent',
    rose: 'text-apple-text-primary',
  }
  return (
    <div className="rounded-2xl border border-apple-border bg-apple-card p-4 text-center shadow-sm">
      <p className={`text-2xl font-extrabold ${tones[tone]}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-apple-text-muted">
        {label}
      </p>
    </div>
  )
}
