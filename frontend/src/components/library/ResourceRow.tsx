import { useCallback, useState } from 'react'
import { DownloadIcon, FileTextIcon } from '@/components/icons'
import { PdfPreviewModal } from '@/components/ui/PdfPreviewModal'
import { fetchResourceDownload } from '@/api/iiia'
import type { IIIAResource } from '@/types/iiia'
import { formatFileSize } from '@/lib/utils'

interface ResourceRowProps {
  resource: IIIAResource
  /** Semester badge displayed in the preview header. */
  semesterLabel?: string | null
}

export function ResourceRow({ resource, semesterLabel }: ResourceRowProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const loadPreviewUrl = useCallback(
    () => fetchResourceDownload(resource.id),
    [resource.id],
  )

  async function handleDirectDownload() {
    setPreviewError(null)
    try {
      const url = await fetchResourceDownload(resource.id)
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : 'Téléchargement impossible.',
      )
    }
  }

  const meta = [
    resource.academicYear,
    formatFileSize(resource.fileSize),
    resource.professorName,
  ]
    .filter(Boolean)
    .join(' • ')

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-apple-border/60 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apple-blue-light text-apple-text-primary">
            <FileTextIcon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-apple-text-primary">
              {resource.title}
            </h4>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-apple-text-secondary">
              {resource.professorName && (
                <>
                  <span>{resource.professorName}</span>
                  <span className="h-3 w-[1px] bg-apple-border" />
                </>
              )}
              <span>{resource.academicYear}</span>
              <span className="h-3 w-[1px] bg-apple-border" />
              <span>{formatFileSize(resource.fileSize)}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:pl-6">
          {previewError && (
            <span className="text-xs text-apple-text-muted">{previewError}</span>
          )}
          <button
            type="button"
            onClick={() => {
              setPreviewError(null)
              setPreviewOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-apple-border bg-apple-card px-4 py-2.5 text-xs font-semibold text-apple-text-primary transition-all duration-200 hover:border-signal-light hover:bg-signal-light"
          >
            <FileTextIcon className="h-3.5 w-3.5" />
            Prévisualiser
          </button>
          <button
            type="button"
            onClick={handleDirectDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-apple-border bg-apple-card px-4 py-2.5 text-xs font-semibold text-apple-text-primary transition-all duration-200 hover:border-signal-light hover:bg-signal-light"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Télécharger
          </button>
        </div>
      </div>

      <PdfPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={resource.title}
        semesterLabel={semesterLabel}
        categoryLabel={resource.category}
        meta={meta}
        filename={`${resource.title}.pdf`}
        loadUrl={loadPreviewUrl}
      />
    </>
  )
}
