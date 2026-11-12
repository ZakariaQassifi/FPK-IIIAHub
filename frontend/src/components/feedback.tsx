export function MockBadge() {
  return (
    <span
      title="API non connectée : données de démonstration affichées"
      className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-apple-text-primary"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      Données de démonstration
    </span>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-apple-border bg-apple-card p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-accent-soft" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-accent-soft" />
      </div>
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-accent-soft" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-accent-soft" />
      <div className="mt-6 h-3 w-2/3 animate-pulse rounded bg-accent-soft" />
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="rounded-2xl border border-apple-border bg-apple-card p-5">
      <div className="h-4 w-2/3 animate-pulse rounded bg-accent-soft" />
      <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-accent-soft" />
    </div>
  )
}

export function NotFoundMessage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-apple-border bg-apple-bg p-10 text-center">
      <p className="text-base font-semibold text-apple-text-primary">
        {title}
      </p>
      <p className="mt-2 text-sm text-apple-text-muted">
        {description}
      </p>
    </div>
  )
}
