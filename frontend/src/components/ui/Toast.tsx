import { useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, CloseIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

export type ToastTone = 'success' | 'error'

interface ToastProps {
  tone: ToastTone
  title: string
  description?: string
  onDismiss: () => void
  autoDismissMs?: number
}

export function Toast({
  tone,
  title,
  description,
  onDismiss,
  autoDismissMs = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!autoDismissMs) return
    const timer = window.setTimeout(onDismiss, autoDismissMs)
    return () => window.clearTimeout(timer)
  }, [autoDismissMs, onDismiss])

  const isSuccess = tone === 'success'

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      aria-live={isSuccess ? 'polite' : 'assertive'}
      className="fixed bottom-6 right-6 z-50 w-[min(24rem,calc(100vw-3rem))] animate-[fadeIn_200ms_ease-out]"
    >
      <div
        className={cn(
          'flex items-start gap-3 rounded-2xl border bg-apple-card p-4 shadow-lg',
          isSuccess ? 'border-signal-light' : 'border-rose-300',
        )}
      >
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            isSuccess
              ? 'bg-signal-light text-apple-text-primary'
              : 'bg-rose-100 text-rose-600',
          )}
        >
          {isSuccess ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <XCircleIcon className="h-5 w-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-apple-text-primary">
            {title}
          </p>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-apple-text-secondary">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer"
          className="shrink-0 rounded-lg p-1 text-apple-text-muted transition-colors hover:bg-apple-blue-light/40 hover:text-apple-text-primary"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
