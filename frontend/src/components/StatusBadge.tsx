import type { SubmissionStatus } from '@/types'

const STATUS_STYLES: Record<SubmissionStatus, { label: string; classes: string }> =
  {
    PENDING: {
      label: 'En attente',
      classes:
        'bg-accent-soft text-apple-text-primary',
    },
    PENDING_REVIEW: {
      label: 'En cours de validation',
      classes:
        'bg-accent-soft text-accent',
    },
    APPROVED: {
      label: 'Validé',
      classes:
        'bg-accent-soft text-accent',
    },
    REJECTED: {
      label: 'Rejeté',
      classes:
        'bg-accent-soft text-apple-text-primary',
    },
  }

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    classes: 'bg-accent-soft text-apple-text-primary',
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  )
}
