import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/icons'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

interface LibraryCTAProps {
  className?: string
}

export function LibraryCTA({ className }: LibraryCTAProps) {
  const { t } = useI18n()

  return (
    <section className={cn('py-20 sm:py-24', className)}>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="rounded-2xl border border-apple-border bg-accent-soft/30 p-10 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="sm:max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-apple-text-primary sm:text-4xl">
              {t('cta.title')}
            </h2>
            <p className="mt-4 text-sm text-apple-text-secondary">
              {t('cta.subtitle')}
            </p>
          </div>
          <div className="mt-8 sm:mt-0">
            <Link to="/library" className="apple-btn-primary lg:px-8 lg:py-4">
              {t('cta.button')}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
