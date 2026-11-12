import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CloseIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'

export interface PdfPreviewModalProps {
  /** Whether the modal is visible. */
  open: boolean
  /** Called when the user dismisses the modal. */
  onClose: () => void
  /** Document title shown in the header. */
  title: string
  /** Semester (or any contextual) badge shown next to the title. */
  semesterLabel?: string | null
  /** Secondary badge, e.g. the resource category. */
  categoryLabel?: string | null
  /** Free-form metadata line, e.g. "2.4 MB • 2025/2026". */
  meta?: string | null
  /** Already resolved previewable URL. Takes precedence over `loadUrl`. */
  url?: string | null
  /** Resolve the previewable URL on demand (e.g. a signed URL). */
  loadUrl?: () => Promise<string>
  /** Filename suggested for the download. */
  filename?: string | null
}

type Status = 'loading' | 'ready' | 'error'

interface PreviewResult {
  /** Identifies which document the result belongs to. */
  key: string
  url: string | null
  error: string | null
}

export function PdfPreviewModal({
  open,
  onClose,
  title,
  semesterLabel,
  categoryLabel,
  meta,
  url,
  loadUrl,
  filename,
}: PdfPreviewModalProps) {
  const [result, setResult] = useState<PreviewResult | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // The result is keyed by document so switching documents never shows a
  // stale PDF, and the status is derived instead of stored.
  const documentKey = url ?? 'dynamic'
  const current = result?.key === documentKey ? result : null

  const status: Status = url
    ? 'ready'
    : current?.error || !loadUrl
      ? 'error'
      : current?.url
        ? 'ready'
        : 'loading'

  const resolvedUrl = url ?? current?.url ?? null
  const errorMessage =
    current?.error ??
    'Aucune source de prévisualisation disponible pour ce document.'

  // Resolve the URL whenever the modal opens.
  useEffect(() => {
    if (!open) return
    if (url) return

    if (!loadUrl) return

    let cancelled = false
    loadUrl().then(
      (resolved) => {
        if (cancelled) return
        setResult({ key: documentKey, url: resolved, error: null })
      },
      (err: unknown) => {
        if (cancelled) return
        setResult({
          key: documentKey,
          url: null,
          error:
            err instanceof Error
              ? err.message
              : 'Impossible de générer un lien de prévisualisation.',
        })
      },
    )

    return () => {
      cancelled = true
    }
  }, [open, url, documentKey, loadUrl])

  // Lock the page scroll while the modal is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Move focus to the close button and handle Escape.
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose()
    },
    [onClose],
  )

  if (!open) return null

  const downloadName = filename ?? title

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Prévisualisation — ${title}`}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md"
    >
      <div
        className={cn(
          'flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden',
          'rounded-2xl border border-apple-border bg-apple-card shadow-2xl',
        )}
      >
        {/* ------------------------------ Header ------------------------------ */}
        <div className="flex items-start justify-between gap-4 border-b border-apple-border/60 px-6 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apple-blue-light text-apple-text-primary">
              <FileTextIcon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold leading-snug text-apple-text-primary">
                {title}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-apple-text-secondary">
                {semesterLabel && (
                  <span className="rounded-full border border-signal-light bg-signal-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-apple-text-primary">
                    {semesterLabel}
                  </span>
                )}
                {categoryLabel && (
                  <span className="rounded-full bg-apple-blue-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-apple-text-primary">
                    {categoryLabel}
                  </span>
                )}
                {meta && <span>{meta}</span>}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {resolvedUrl && (
              <a
                href={resolvedUrl}
                download={downloadName}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-signal-light bg-signal-light px-4 text-xs font-semibold text-apple-text-primary transition-all duration-200 hover:brightness-95"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                Télécharger
              </a>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer la prévisualisation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-apple-text-secondary transition-colors hover:bg-apple-blue-light/40 hover:text-apple-text-primary"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ------------------------------- Viewer ------------------------------ */}
        <div className="min-h-0 flex-1 overflow-auto bg-apple-bg">
          {status === 'loading' && (
            <div className="flex h-[70vh] items-center justify-center">
              <span
                aria-label="Chargement du document"
                className="h-10 w-10 animate-spin rounded-full border-[3px] border-apple-blue-light border-t-apple-blue"
              />
            </div>
          )}

          {status === 'error' && (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-4 px-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-apple-blue-light text-apple-text-primary">
                <FileTextIcon className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-apple-text-primary">
                Prévisualisation indisponible
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-apple-text-secondary">
                {errorMessage}
              </p>
            </div>
          )}

          {status === 'ready' && resolvedUrl && (
            <>
              <object
                data={resolvedUrl}
                type="application/pdf"
                className="h-[70vh] w-full"
                aria-label={title}
              >
                {/* Browsers without an inline PDF viewer render this. */}
                <div className="flex h-[70vh] flex-col items-center justify-center gap-4 px-8 text-center">
                  <p className="text-sm font-semibold text-apple-text-primary">
                    Ce navigateur ne peut pas afficher le PDF ici.
                  </p>
                  <a
                    href={resolvedUrl}
                    download={downloadName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-signal-light bg-signal-light px-4 py-2.5 text-xs font-semibold text-apple-text-primary"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    Ouvrir dans un nouvel onglet
                  </a>
                </div>
              </object>

              {/* Always-available escape hatch for browsers without an
                  inline PDF renderer (notably Safari on macOS / iOS). */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-apple-border/60 bg-apple-card px-6 py-3 text-xs text-apple-text-secondary">
                <span>
                  Si le document ne s'affiche pas, ouvrez-le dans un nouvel
                  onglet.
                </span>
                <a
                  href={resolvedUrl}
                  download={downloadName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-apple-text-primary transition-colors hover:text-[#007AFF] hover:underline"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  Ouvrir dans un nouvel onglet
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
