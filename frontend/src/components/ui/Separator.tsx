import { cn } from '@/lib/utils'

interface SeparatorProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  label?: string
}

export function Separator({
  className,
  orientation = 'horizontal',
  label,
}: SeparatorProps) {
  if (orientation === 'vertical') {
    return (
      <span
        className={cn(
          'h-4 w-[1px] bg-apple-border mx-2 shrink-0',
          className,
        )}
        aria-orientation="vertical"
      />
    )
  }

  return (
    <div
      className={cn(
        'relative flex w-full items-center gap-4 border-t border-apple-border/60',
        className,
      )}
    >
      {label ? (
        <span className="px-3 text-xs font-semibold uppercase tracking-wider text-apple-text-muted bg-apple-bg/50">
          {label}
        </span>
      ) : (
        <span className="flex-1 border-t border-apple-border/60" />
      )}
    </div>
  )
}
