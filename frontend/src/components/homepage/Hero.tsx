import { Link } from 'react-router-dom'
import { BookOpenIcon, MegaphoneIcon } from '@/components/icons'
import { useI18n } from '@/i18n'

export function Hero() {
  const { t } = useI18n()

  const stats = [
    { label: t('hero.statResources'), value: '180+' },
    { label: t('hero.statModules'), value: '42' },
    { label: t('hero.statSemesters'), value: '10' },
    { label: t('hero.statProgram'), value: 'IIIA' },
  ]

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-apple-bg text-apple-text-primary"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/6 h-96 w-96 rounded-full bg-accent-soft/40 blur-[120px]" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-signal/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 py-24 sm:py-32">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-apple-border bg-accent-soft/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-apple-text-secondary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            {t('hero.eyebrow')}
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            {t('hero.title')}
            <br />
            <span className="text-apple-text-primary">{t('hero.titleAccent')}</span>
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-relaxed text-apple-text-secondary">
            {t('hero.subtitle')}
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link to="/library" className="apple-btn-primary">
              {t('hero.ctaPrimary')}
              <span className="ml-2">
                <BookOpenIcon className="h-4 w-4" />
              </span>
            </Link>
            <Link
              to="#announcements"
              className="inline-flex items-center gap-2 rounded-xl border border-apple-border bg-transparent px-6 py-3 text-sm font-semibold text-apple-text-secondary backdrop-blur transition-colors hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary"
            >
              <MegaphoneIcon className="h-4 w-4" />
              {t('hero.ctaSecondary')}
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-x-10 gap-y-8 border-t border-apple-border/60 pt-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-apple-text-muted">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-3xl font-bold text-apple-text-primary">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
