import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'

const columnTitleClasses =
  'font-bold uppercase tracking-wider text-xs text-black'

const linkClasses =
  'text-sm text-apple-text-secondary transition-colors duration-200 hover:text-signal hover:underline'

const itemClasses = 'text-sm text-apple-text-secondary'

export function Footer() {
  const { t } = useI18n()

  const navigationLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.library'), to: '/library' },
    { label: t('nav.about'), to: '/about' },
  ]

  const studyLevels = [
    { label: t('footer.level.licence'), to: '/library/S1' },
    { label: t('footer.level.master'), to: '/library/MS1' },
    { label: t('footer.level.timetables'), to: '/library' },
    { label: t('footer.level.announcements'), to: '/#announcements' },
  ]

  const disclaimers = [
    t('footer.disclaimer.initiative'),
    t('footer.disclaimer.byStudent'),
    t('footer.disclaimer.unofficial'),
  ]

  return (
    <footer className="bg-apple-bg pt-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="border-t border-apple-border/30" />

        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/IIIA_Logo.jpg"
                alt="Logo du département Génie Informatique et Intelligence Artificielle — FPK Khouribga"
                className="h-9 w-auto rounded-lg object-contain"
              />
              <span className="text-lg font-bold uppercase tracking-tight text-black">
                FPK IIIA Hub
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-apple-text-secondary">
              {t('footer.description')}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h2 className={columnTitleClasses}>{t('footer.navigationTitle')}</h2>
            <ul className="mt-6 space-y-3.5">
              {navigationLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className={columnTitleClasses}>{t('footer.levelsTitle')}</h2>
            <ul className="mt-6 space-y-3.5">
              {studyLevels.map((level) => (
                <li key={level.to}>
                  <Link to={level.to} className={linkClasses}>
                    {level.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className={columnTitleClasses}>{t('footer.aboutTitle')}</h2>
            <ul className="mt-6 space-y-3.5">
              {disclaimers.map((item) => (
                <li key={item} className={itemClasses}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className={columnTitleClasses}>{t('footer.creditsTitle')}</h2>
            <p className="mt-6 text-sm leading-relaxed text-apple-text-secondary">
              {t('footer.creditsText')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-apple-border/30 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-apple-text-secondary">
            {t('footer.copyright')}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-apple-text-muted">
            <span>{t('footer.country')}</span>
            <span aria-hidden="true" className="text-apple-border">
              |
            </span>
            <span>{t('footer.independent')}</span>
            <span aria-hidden="true" className="text-apple-border">
              |
            </span>
            <span>{t('footer.zexter')}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
