import type { IIIAAnnouncement } from '@/types/iiia'
import { useI18n } from '@/i18n'
import { formatDate } from '@/lib/utils'

const CATEGORY_STYLES: Record<string, string> = {
  EXAMEN: 'border-signal-light bg-signal-light text-apple-text-primary',
  ADMINISTRATIF: 'border-signal-light bg-signal-light text-apple-text-primary',
  PEDAGOGIQUE: 'border-signal-light bg-signal-light text-apple-text-primary',
}

export function AnnouncementTicker({
  announcements,
}: {
  announcements: IIIAAnnouncement[]
}) {
  const { t, locale } = useI18n()
  const pinned = announcements.filter((a) => a.isPinned)

  return (
    <section
      id="announcements"
      className="scroll-mt-24 border-t border-apple-border bg-apple-bg py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="section-header">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-apple-text-primary">
              {t('announcements.title')}
            </h2>
            <p className="mt-2 text-sm text-apple-text-secondary">
              {t('announcements.subtitle')}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pinned.map((announcement) => {
            const style =
              CATEGORY_STYLES[announcement.category] ??
              CATEGORY_STYLES.ADMINISTRATIF
            return (
              <article
                key={announcement.id}
                className="group relative rounded-2xl border border-apple-border bg-apple-card p-8 transition-all duration-200 hover:border-signal-light hover:bg-signal-light"
              >
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-apple-card text-apple-text-secondary shadow-md backdrop-blur">
                    📌
                  </span>
                </div>
                <span className={style}>{announcement.category}</span>

                <h3 className="mt-4 text-base font-bold leading-snug text-apple-text-primary group-hover:underline">
                  {announcement.title}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-apple-text-secondary line-clamp-2">
                  {announcement.content}
                </p>

                <div className="mt-8 pt-6 border-t border-apple-border/60 text-xs text-apple-text-muted">
                  <span className="inline-flex items-center gap-2">
                    📅 {formatDate(announcement.publishedAt, locale)}
                  </span>
                  {announcement.expiresAt && (
                    <span className="ml-4">
                      {t('announcements.validUntil')}{' '}
                      {formatDate(announcement.expiresAt, locale)}
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {pinned.length === 0 && (
          <div className="mt-10 rounded-2xl border border-apple-border bg-accent-soft/30 p-10 text-center">
            <p className="text-sm text-apple-text-secondary">
              {t('announcements.empty')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
