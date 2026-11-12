import { useState } from 'react'
import { FileTextIcon, PencilIcon } from '@/components/icons'
import { useAdminMutations, useAdminResources } from '@/hooks/useAdmin'
import { useI18n } from '@/i18n'
import { formatDate, formatFileSize } from '@/lib/utils'
import type { AdminResource } from '@/types/iiia'

const CATEGORY_OPTIONS = [
  { label: 'Cours', value: 'COURS' },
  { label: 'TD', value: 'TD' },
  { label: 'TP', value: 'TP' },
  { label: 'Examens', value: 'EXAMS' },
  { label: 'Corrigés', value: 'CORRECTIONS' },
  { label: 'Others', value: 'OTHERS' },
]

const inputClasses =
  'w-full rounded-xl border border-apple-border bg-apple-card px-3.5 py-2.5 text-sm text-apple-text-primary transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20'

const labelClasses =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-apple-text-secondary'

interface ResourceManagerProps {
  token: string
  onChanged?: () => void
}

export function ResourceManager({ token, onChanged }: ResourceManagerProps) {
  const { t, locale } = useI18n()
  const resourcesQuery = useAdminResources(token)
  const resources = resourcesQuery.data ?? []
  const mutations = useAdminMutations(token)

  const [editing, setEditing] = useState<AdminResource | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDelete(resource: AdminResource) {
    if (!window.confirm(t('admin.deleteResourceConfirm', { title: resource.title })))
      return
    setBusyId(resource.id)
    setActionError(null)
    try {
      await mutations.deleteResource(resource.id)
      onChanged?.()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleSave(patch: {
    title: string
    category: string
    academicYear: string
  }) {
    if (!editing) return
    await mutations.editResource(editing.id, patch)
    setEditing(null)
    onChanged?.()
  }

  return (
    <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
      <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
        {t('admin.publishedResources')}
      </h3>
      <p className="mt-2 max-w-md text-sm text-apple-text-secondary">
        {t('admin.publishedResourcesDescription')}
      </p>

      {actionError && (
        <p className="mt-5 rounded-xl border border-apple-border bg-apple-blue-light/40 px-4 py-3 text-xs font-medium text-apple-text-primary">
          {actionError}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {resourcesQuery.loading &&
          [0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-apple-blue-light/40"
            />
          ))}

        {!resourcesQuery.loading && resources.length === 0 && (
          <p className="rounded-xl border border-dashed border-apple-border p-10 text-center text-sm text-apple-text-secondary">
            {t('admin.noResources')}
          </p>
        )}

        {!resourcesQuery.loading &&
          resources.map((resource) => (
            <div
              key={resource.id}
              className="flex flex-col gap-4 rounded-xl border border-apple-border bg-apple-bg p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apple-blue-light text-apple-text-primary">
                  <FileTextIcon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-apple-text-primary">
                    {resource.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-apple-text-secondary">
                    {resource.moduleCode && (
                      <>
                        <span>
                          {resource.moduleCode}
                          {resource.semesterName ? ` · ${resource.semesterName}` : ''}
                        </span>
                        <span className="h-3 w-[1px] bg-apple-border" />
                      </>
                    )}
                    <span>{resource.category}</span>
                    <span className="h-3 w-[1px] bg-apple-border" />
                    <span>{formatFileSize(resource.fileSize)}</span>
                    <span className="h-3 w-[1px] bg-apple-border" />
                    <span>{formatDate(resource.createdAt, locale)}</span>
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(resource)}
                  disabled={busyId === resource.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-secondary transition-colors hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary disabled:opacity-50"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  {t('admin.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(resource)}
                  disabled={busyId === resource.id}
                  className="rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-primary transition-colors hover:border-black hover:bg-apple-blue-light/40 disabled:opacity-50"
                >
                  {t('admin.delete')}
                </button>
              </div>
            </div>
          ))}
      </div>

      {editing && (
        <EditResourceModal
          resource={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function EditResourceModal({
  resource,
  onClose,
  onSave,
}: {
  resource: AdminResource
  onClose: () => void
  onSave: (patch: {
    title: string
    category: string
    academicYear: string
  }) => Promise<void>
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState(resource.title)
  const [category, setCategory] = useState(resource.category)
  const [academicYear, setAcademicYear] = useState(resource.academicYear)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      await onSave({ title: title.trim(), category, academicYear })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-apple-text-primary/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-apple-border bg-apple-card p-8 shadow-2xl">
        <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
          {t('admin.editResource')}
        </h3>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="em-title" className={labelClasses}>
              {t('admin.fieldTitle')}
            </label>
            <input
              id="em-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              className={inputClasses}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="em-category" className={labelClasses}>
                {t('admin.fieldCategory')}
              </label>
              <select
                id="em-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as AdminResource['category'])
                }
                className={inputClasses}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="em-year" className={labelClasses}>
                {t('admin.fieldAcademicYear')}
              </label>
              <input
                id="em-year"
                type="text"
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {saveError && (
            <p className="rounded-xl border border-apple-border bg-apple-blue-light/40 px-4 py-3 text-xs font-medium text-apple-text-primary">
              {saveError}
            </p>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-apple-border px-4 py-2.5 text-sm font-semibold text-apple-text-secondary transition-colors hover:bg-apple-blue-light/40"
          >
            {t('admin.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-signal-light bg-signal-light px-5 py-2.5 text-sm font-semibold text-apple-text-primary transition-all duration-200 disabled:opacity-50 hover:brightness-95"
          >
            <PencilIcon className="h-4 w-4" />
            {saving ? t('admin.saving') : t('admin.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
