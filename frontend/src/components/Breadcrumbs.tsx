import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@/components/icons'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center gap-1 text-sm text-apple-text-muted"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="transition-colors hover:text-signal"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'font-medium text-apple-text-primary' : ''}
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRightIcon className="h-3.5 w-3.5 text-apple-text-muted" />}
          </span>
        )
      })}
    </nav>
  )
}
