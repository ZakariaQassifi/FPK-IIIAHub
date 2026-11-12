import { useState } from 'react'
import { PdfPreviewModal } from '@/components/ui/PdfPreviewModal'
import { NotFoundMessage, RowSkeleton } from '@/components/feedback'
import {
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  FileTextIcon,
  UsersIcon,
  XCircleIcon,
} from '@/components/icons'
import { useI18n } from '@/i18n'
import type { PendingSubmission } from '@/api/admin'

interface PendingQueueProps {
  submissions: PendingSubmission[]
  loading: boolean
  error: string | null
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  onPreview: (id: string) => Promise<string>
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

function formatFileSize(bytes: number | null) {
  if (bytes == null) return '—'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function PendingQueue({
  submissions,
  loading,
  error,
  onApprove,
  onReject,
  onPreview,
}: PendingQueueProps) {
  const { t } = useI18n()

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [preview, setPreview] = useState<PendingSubmission | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function run(id: string, action: () => Promise<void>) {
    setBusyId(id)
    setActionError(null)
    try {
      await action()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('admin.errorGeneric'))
    } finally {
      setBusyId(null)
    }
  }

  async function handlePreview(submission: PendingSubmission) {
    setActionError(null)
    setPreviewUrl(null)
    setPreview(submission)
    try {
      setPreviewUrl(await onPreview(submission.id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('admin.errorGeneric'))
    }
  }

  async function handleApprove(submission: PendingSubmission) {
    if (!window.confirm(t('admin.approveConfirm', { title: submission.title }))) {
      return
    }
    await run(submission.id, () => onApprove(submission.id))
  }

  async function handleReject(submission: PendingSubmission) {
    if (!window.confirm(t('admin.rejectConfirm', { title: submission.title }))) {
      return
    }
    await run(submission.id, () => onReject(submission.id))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <RowSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <NotFoundMessage
        title={t('admin.queueLoadError')}
        description={error}
      />
    )
  }

  if (submissions.length === 0) {
    return (
      <NotFoundMessage
        title={t('admin.queueEmpty')}
        description={t('admin.queueEmptyDescription')}
      />
    )
  }

  return (
    <div>
      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium leading-relaxed text-rose-700"
        >
          {actionError}
        </p>
      )}

      <ul className="space-y-3">
        {submissions.map((submission) => {
          const busy = busyId === submission.id
          return (
            <li
              key={submission.id}
              className="flex flex-col gap-4 rounded-2xl border border-apple-border bg-apple-card p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-apple-blue-light text-apple-text-primary">
                  <FileTextIcon className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-apple-blue-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-apple-text-primary">
                      {submission.category}
                    </span>
                    {submission.semesterName && (
                      <span className="rounded-full border border-apple-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-apple-text-secondary">
                        {submission.semesterName}
                      </span>
                    )}
                    {submission.moduleCode && (
                      <span className="text-xs font-semibold text-apple-text-secondary">
                        {submission.moduleCode}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-semibold leading-snug text-apple-text-primary">
                    {submission.title}
                  </h3>

                  <div className="mt-3 grid gap-1 text-xs text-apple-text-secondary sm:grid-cols-2">
                    <p className="flex items-center gap-1.5 truncate">
                      <UsersIcon className="h-3.5 w-3.5 shrink-0 text-apple-text-muted" />
                      {submission.contributorName ??
                        submission.contributorEmail ??
                        t('admin.anonymous')}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <BookOpenIcon className="h-3.5 w-3.5 shrink-0 text-apple-text-muted" />
                      {submission.moduleCode
                        ? `${submission.moduleCode} — ${submission.moduleTitle ?? ''}`
                        : submission.moduleTitle ?? '—'}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-apple-text-muted" />
                      {submission.semesterName ?? '—'} · {submission.academicYear}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <FileTextIcon className="h-3.5 w-3.5 shrink-0 text-apple-text-muted" />
                      {formatFileSize(submission.fileSize)}
                    </p>
                  </div>

                  {submission.contributorEmail && (
                    <p className="mt-1 truncate text-xs text-apple-text-muted">
                    {submission.contributorEmail}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-apple-text-muted">
                    {t('admin.submittedOn', {
                      date: formatDate(submission.createdAt),
                    })}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePreview(submission)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-secondary transition-colors duration-200 hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary disabled:opacity-50"
                >
                  <FileTextIcon className="h-3.5 w-3.5" />
                  {t('admin.view')}
                </button>

                <button
                  type="button"
                  onClick={() => handleReject(submission)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-primary transition-colors duration-200 hover:border-black hover:bg-apple-blue-light/40 disabled:opacity-50"
                >
                  <XCircleIcon className="h-3.5 w-3.5" />
                  {t('admin.reject')}
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(submission)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-signal-light bg-signal-light px-3 py-1.5 text-xs font-semibold text-apple-text-primary transition-all duration-200 hover:brightness-95 disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  {t('admin.approve')}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {preview && (
        <PdfPreviewModal
          open={!!preview}
          onClose={() => {
            setPreview(null)
            setPreviewUrl(null)
          }}
          title={preview.title}
          semesterLabel={preview.semesterName}
          categoryLabel={preview.category}
          meta={[
            preview.moduleCode,
            preview.academicYear,
            formatFileSize(preview.fileSize),
          ]
            .filter(Boolean)
            .join(' • ')}
          filename={`${preview.title}.pdf`}
          url={previewUrl}
          loadUrl={
            previewUrl ? undefined : () => onPreview(preview.id)
          }
        />
      )}
    </div>
  )
}
