import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'cours'
  | 'td_tp'
  | 'exams'
  | 'corrections'
  | 'licence'
  | 'master'

const VARIANTS: Record<BadgeVariant, string> = {
  cours: 'border-accent-soft bg-accent/10 text-accent',
  td_tp: 'border-accent-soft bg-accent/10 text-accent',
  exams: 'border-accent-soft bg-accent/10 text-accent',
  corrections: 'border-accent-soft bg-accent/10 text-accent',
  licence: 'border-apple-border bg-apple-bg text-apple-text-secondary',
  master: 'border-accent-soft bg-accent/10 text-accent',
}

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

export function Badge({
  variant = 'cours',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
