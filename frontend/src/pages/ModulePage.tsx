import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@/components/icons'
import { Separator } from '@/components/ui/Separator'
import { ResourceRow } from '@/components/library/ResourceRow'
import { useModuleResources } from '@/hooks/useLibrary'
import { groupBySection } from '@/lib/library'
import { useI18n } from '@/i18n'

export function ModulePage() {
  const { semester, moduleId } = useParams() as {
    semester?: string
    moduleId?: string
  }
  const navigate = useNavigate()
  const { t } = useI18n()

  const resourcesQuery = useModuleResources(moduleId)
  const resources = resourcesQuery.data ?? []

  // The three canonical sections are always rendered, in order, even when
  // they hold no resource yet.
  const groups = groupBySection(resources)

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
        <Link
          to={`/library/${semester}`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/library/${semester}`)
          }}
          className="mb-10 inline-flex items-center gap-3 rounded-xl border border-apple-border bg-apple-bg px-5 py-3 text-sm font-semibold text-apple-text-secondary shadow-sm transition-all duration-200 hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {t('module.back')}
        </Link>

        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-apple-text-primary">
              {t('module.title')}
            </h1>
            <p className="mt-3 text-sm uppercase tracking-wider text-apple-text-muted">
              {semester?.toUpperCase()}
            </p>
          </div>
          <Separator label={t('module.separator')} />
        </div>

        {resourcesQuery.loading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-apple-blue-light/40"
              />
            ))}
          </div>
        ) : resourcesQuery.error ? (
          <div className="rounded-2xl border border-dashed border-apple-border bg-apple-card p-12 text-center">
            <p className="text-sm text-apple-text-secondary">
              {resourcesQuery.error}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map(({ section, items }) => (
              <section key={section.key}>
                <div className="mb-5 flex items-center justify-between gap-6">
                  <h2 className="text-2xl font-bold tracking-tight text-apple-text-primary">
                    {t(section.labelKey)}
                  </h2>
                  <span className="rounded-full bg-apple-blue-light px-3 py-1 text-xs font-semibold text-apple-text-primary">
                    {items.length}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-apple-border bg-apple-bg px-6 py-10 text-center">
                    <p className="text-sm font-medium text-apple-text-secondary">
                      {t('module.sectionEmpty')}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-apple-border bg-apple-card px-6">
                    {items.map((resource) => (
                      <ResourceRow
                        key={resource.id}
                        resource={resource}
                        semesterLabel={semester?.toUpperCase() ?? null}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
