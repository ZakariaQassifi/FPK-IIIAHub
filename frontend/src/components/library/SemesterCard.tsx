import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'

interface SemesterCardProps {
  label: string
  level: 'LICENCE' | 'MASTER'
  resourceCount: number
  isSelected?: boolean
  onClick?: () => void
}

const LEVEL_STYLES: Record<'LICENCE' | 'MASTER', string> = {
  LICENCE: 'border-signal-light bg-signal-light text-apple-text-primary',
  MASTER: 'border-signal-light bg-signal-light text-apple-text-primary',
}

export function SemesterCard({
  label,
  level,
  resourceCount,
  isSelected = false,
  onClick,
}: SemesterCardProps) {
  const { t } = useI18n()

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={cn(
        'relative rounded-2xl border p-6 text-left transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-signal-light bg-signal-light text-apple-text-primary shadow-sm'
          : 'border-apple-border bg-apple-card text-apple-text-primary hover:border-signal-light hover:bg-signal-light',
      )}
    >
      {/* Header row: level badge (left) and resource counter (right).
          The title sits below in its own row so the badge never competes
          with the counter for horizontal space. */}
      <div className="flex w-full items-center justify-between gap-4">
        <span
          className={cn(
            'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider',
            LEVEL_STYLES[level],
          )}
        >
          {level === 'LICENCE' ? t('semester.licence') : t('semester.master')}
        </span>
        <span className="shrink-0 text-2xl font-bold leading-none">
          {resourceCount}
        </span>
      </div>

      <h3 className="mt-5 break-words text-xl font-bold leading-snug">
        {t('semesterCard.title', { label })}
      </h3>
    </article>
  )
}
