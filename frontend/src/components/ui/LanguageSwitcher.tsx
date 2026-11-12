import { LOCALE_LABELS, LOCALES, useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className="inline-flex shrink-0 items-center rounded-xl border border-apple-border bg-apple-card p-0.5"
    >
      {LOCALES.map((option) => {
        const isActive = locale === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={isActive}
            className={cn(
              'inline-flex h-8 items-center rounded-[10px] px-3 text-xs font-semibold leading-none transition-all duration-200',
              isActive
                ? 'bg-signal-light text-apple-text-primary shadow-sm'
                : 'text-apple-text-secondary hover:text-signal',
            )}
          >
            {LOCALE_LABELS[option]}
          </button>
        )
      })}
    </div>
  )
}
