import type { IIIAResource } from '@/types/iiia'
import { Link } from 'react-router-dom'
import { DownloadIcon } from '@/components/icons'
import { Badge } from '@/components/ui/Badge'
import { useI18n } from '@/i18n'
import { formatDate, formatFileSize } from '@/lib/utils'

const CATEGORY_BADGE: Record<string, string> = {
  COURS: 'cours',
  TD_TP: 'td_tp',
  EXAMS: 'exams',
  CORRECTIONS: 'corrections',
}

interface ResourceCardProps {
  resource: IIIAResource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { t, locale } = useI18n()
  const badgeVariant = CATEGORY_BADGE[resource.category] ?? 'cours'

  return (
    <article className="apple-card">
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-start justify-between gap-3">
            <Badge variant={badgeVariant as any}>
              {t(`category.${resource.category}` as 'category.COURS')}
            </Badge>
            <span className="ml-auto text-xs text-apple-text-muted">
              {formatDate(resource.uploadedAt, locale)}
            </span>
          </div>
          <h3 className="text-base font-bold leading-snug text-apple-text-primary">
            {resource.title}
          </h3>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-apple-text-secondary">
            <span className="flex items-center gap-1">
              {resource.professorName ?? t('resource.professorUnknown')}
            </span>
            <span className="h-4 w-[1px] shrink-0 bg-apple-border" />
            <span>{formatFileSize(resource.fileSize)}</span>
            <span className="h-4 w-[1px] shrink-0 bg-apple-border" />
            <span>{resource.academicYear}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-end gap-2 lg:mt-0">
          <Link
            to={resource.fileUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-apple-border bg-apple-bg px-4 py-2.5 text-xs font-semibold text-apple-text-secondary shadow-sm transition-all hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary"
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            {t('resource.download')}
          </Link>
        </div>
      </div>
    </article>
  )
}
