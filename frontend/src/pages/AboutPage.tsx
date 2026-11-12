import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import type { TranslationKey } from '@/i18n'

const FEATURE_KEYS: { title: TranslationKey; description: TranslationKey }[] = [
  { title: 'about.feature.cours.title', description: 'about.feature.cours.description' },
  { title: 'about.feature.td_tp.title', description: 'about.feature.td_tp.description' },
  { title: 'about.feature.exams.title', description: 'about.feature.exams.description' },
  { title: 'about.feature.timetables.title', description: 'about.feature.timetables.description' },
  { title: 'about.feature.announcements.title', description: 'about.feature.announcements.description' },
]

export function AboutPage() {
  const { t } = useI18n()

  return (
    <section className="bg-apple-bg py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-apple-text-primary sm:text-4xl">
            {t('about.title')}
          </h1>
          <p className="mt-4 text-xl text-apple-text-secondary">
            FPK IIIA Academic Hub
          </p>

          <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-apple-text-secondary">
            {t('about.kicker')}
          </p>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center rounded-2xl border border-apple-border bg-apple-card p-10 shadow-sm">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-apple-text-primary">
              {t('about.missionTitle')}
            </h2>
            <p className="mb-6 leading-relaxed text-apple-text-secondary">
              {t('about.missionBody1')}
            </p>
            <p className="leading-relaxed text-apple-text-secondary">
              {t('about.missionBody2')}
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-apple-border bg-apple-card p-10 shadow-sm">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-apple-text-primary">
              {t('about.featuresTitle')}
            </h2>
            <ul className="text-apple-text-secondary">
              {FEATURE_KEYS.map((feature) => (
                <li
                  key={feature.title}
                  className="grid grid-cols-1 items-center gap-x-6 gap-y-1 border-b border-gray-100 py-4 last:border-b-0 sm:grid-cols-[150px_1fr]"
                >
                  <span className="font-semibold text-black">
                    {t(feature.title)}
                  </span>
                  <span className="text-sm leading-relaxed">
                    {t(feature.description)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            to="/library"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-signal-light px-6 py-3 text-sm font-semibold text-apple-text-primary shadow-sm transition-colors hover:brightness-95"
          >
            {t('about.cta')}
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
