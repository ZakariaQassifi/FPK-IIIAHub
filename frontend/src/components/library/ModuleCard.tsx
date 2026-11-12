import { Link } from 'react-router-dom'
import { FileTextIcon, ChevronRightIcon } from '@/components/icons'
import type { IIIAModule } from '@/types/iiia'

interface ModuleCardProps {
  module: IIIAModule
  to: string
}

export function ModuleCard({ module, to }: ModuleCardProps) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-5 rounded-2xl border border-apple-border bg-apple-card p-6 transition-all duration-200 hover:border-signal-light hover:bg-signal-light hover:shadow-md"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-apple-blue-light text-apple-text-primary transition-colors group-hover:bg-white">
        <FileTextIcon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-apple-text-muted">
          {module.code}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug text-apple-text-primary">
          {module.title}
        </h3>
        {module.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-apple-text-secondary">
            {module.description}
          </p>
        )}
      </div>

      <span className="flex shrink-0 items-center gap-3 pt-1">
        <span className="rounded-full bg-apple-blue-light px-3 py-1 text-xs font-semibold text-apple-text-primary">
          {module.resourceCount}
        </span>
        <ChevronRightIcon className="h-4 w-4 text-apple-text-muted transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
