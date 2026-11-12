import { useMemo, useState } from 'react'
import { PencilIcon, PlusIcon, TrashIcon } from '@/components/icons'
import { useAdminModules, useAdminMutations } from '@/hooks/useAdmin'
import { useIiiaSemesters } from '@/hooks/useLibrary'
import { useI18n } from '@/i18n'
import type { AdminModule, SemesterSlug } from '@/types/iiia'

/** Mirrors the backend MAX_MODULES_PER_SEMESTER rule. */
const MAX_MODULES_PER_SEMESTER = 7

/** Stable empty array so memoised dependencies keep a constant identity. */
const EMPTY_MODULES: AdminModule[] = []

const inputClasses =
  'w-full rounded-xl border border-apple-border bg-apple-card px-3.5 py-2.5 text-sm text-apple-text-primary placeholder:text-apple-text-muted transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20'

const labelClasses =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-apple-text-secondary'

interface ModuleManagerProps {
  token: string
  version?: number
  onChanged?: () => void
}

export function ModuleManager({
  token,
  version = 0,
  onChanged,
}: ModuleManagerProps) {
  const { t } = useI18n()
  const semestersQuery = useIiiaSemesters()
  const semesters = semestersQuery.data ?? []

  const [semesterSlug, setSemesterSlug] = useState<SemesterSlug | ''>('')
  const [moduleName, setModuleName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminModule | null>(null)

  const modulesQuery = useAdminModules(token, undefined, version)
  const allModules = modulesQuery.data ?? EMPTY_MODULES
  const mutations = useAdminMutations(token)

  const semester = semesters.find((s) => s.slug === semesterSlug)
  const semesterModules = useMemo(
    () =>
      semester
        ? allModules.filter((module) => module.semesterId === semester.id)
        : [],
    [allModules, semester],
  )

  const rows = useMemo(
    () => (semester ? semesterModules : allModules),
    [semester, semesterModules, allModules],
  )

  const limitReached = semesterModules.length >= MAX_MODULES_PER_SEMESTER

  function handleSemesterChange(value: string) {
    setSemesterSlug(value as SemesterSlug | '')
    setModuleName('')
    setCreateError(null)
    setCreateSuccess(null)
  }

  async function handleCreate() {
    setCreateError(null)
    setCreateSuccess(null)

    if (!semester) {
      setCreateError(t('admin.modules.selectSemesterError'))
      return
    }
    if (moduleName.trim().length < 3) {
      setCreateError(t('admin.modules.nameTooShort'))
      return
    }
    if (limitReached) {
      setCreateError(
        t('admin.modules.limitReached', { limit: MAX_MODULES_PER_SEMESTER }),
      )
      return
    }

    setCreating(true)
    try {
      await mutations.createModule({
        semesterId: semester.id,
        title: moduleName.trim(),
      })
      setCreateSuccess(t('admin.modules.created'))
      setModuleName('')
      onChanged?.()
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : t('admin.modules.genericError'),
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(module: AdminModule) {
    if (!window.confirm(t('admin.modules.deleteConfirm', { title: module.title })))
      return
    setBusyId(module.id)
    setCreateError(null)
    try {
      const result = await mutations.deleteModule(module.id)
      const resources = result.deleted_resources ?? 0
      setCreateSuccess(
        resources > 0
          ? t('admin.modules.deletedWithResources', { count: resources })
          : t('admin.modules.deleted'),
      )
      onChanged?.()
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : t('admin.modules.genericError'),
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* ---------------- Creation form ---------------- */}
      <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
        <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
          {t('admin.modules.addTitle')}
        </h3>
        <p className="mt-2 max-w-xl text-sm text-apple-text-secondary">
          {t('admin.modules.addDescription')}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <label htmlFor="mm-semester" className={labelClasses}>
              {t('admin.fieldSemester')}
            </label>
            <select
              id="mm-semester"
              value={semesterSlug}
              onChange={(event) => handleSemesterChange(event.target.value)}
              className={inputClasses}
            >
              <option value="">
                {semestersQuery.loading
                  ? t('admin.loading')
                  : t('admin.selectSemester')}
              </option>
              {semesters.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label} —{' '}
                  {item.level === 'LICENCE'
                    ? t('semester.licence')
                    : t('semester.master')}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-8">
            <label htmlFor="mm-name" className={labelClasses}>
              {t('admin.modules.fieldName')}
            </label>
            <input
              id="mm-name"
              type="text"
              value={moduleName}
              onChange={(event) => {
                setModuleName(event.target.value)
                setCreateError(null)
                setCreateSuccess(null)
              }}
              maxLength={200}
              disabled={!semesterSlug}
              placeholder={t('admin.modules.namePlaceholder')}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Counter + limit indicator */}
        {semester && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-medium text-apple-text-secondary">
              {t('admin.modules.counter', {
                used: semesterModules.length,
                limit: MAX_MODULES_PER_SEMESTER,
              })}
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: MAX_MODULES_PER_SEMESTER }).map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-8 rounded-full transition-colors duration-200 ${
                    index < semesterModules.length
                      ? 'bg-apple-blue'
                      : 'bg-apple-blue-light'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {createError && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-apple-border bg-apple-blue-light/50 px-4 py-3 text-xs font-semibold text-apple-text-primary"
          >
            {createError}
          </p>
        )}
        {createSuccess && (
          <p className="mt-6 rounded-xl border border-signal-light bg-signal-light px-4 py-3 text-xs font-semibold text-apple-text-primary">
            {createSuccess}
          </p>
        )}

        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !semesterSlug || !moduleName.trim() || limitReached}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-signal-light bg-signal-light px-6 py-3 text-sm font-semibold text-apple-text-primary shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-95 hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4" />
          {creating ? t('admin.modules.creating') : t('admin.modules.add')}
        </button>

        {limitReached && (
          <p className="mt-4 text-xs text-apple-text-secondary">
            {t('admin.modules.limitHint', { limit: MAX_MODULES_PER_SEMESTER })}
          </p>
        )}
      </div>

      {/* ---------------- Modules table ---------------- */}
      <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
            {t('admin.modules.tableTitle')}
          </h3>
          <span className="rounded-full bg-apple-blue-light px-3 py-1 text-xs font-semibold text-apple-text-primary">
            {semester
              ? t('admin.modules.countForSemester', {
                  count: semesterModules.length,
                })
              : t('admin.modules.countAll', { count: allModules.length })}
          </span>
        </div>

        <p className="mt-2 text-sm text-apple-text-secondary">
          {semester
            ? t('admin.modules.tableFiltered')
            : t('admin.modules.tableAll')}
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-left">
            <thead>
              <tr className="border-b border-apple-border">
                <th
                  scope="col"
                  className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-apple-text-muted"
                >
                  {t('admin.modules.tableSemester')}
                </th>
                <th
                  scope="col"
                  className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-apple-text-muted"
                >
                  {t('admin.modules.tableName')}
                </th>
                <th
                  scope="col"
                  className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-apple-text-muted"
                >
                  {t('admin.modules.tableResources')}
                </th>
                <th
                  scope="col"
                  className="pb-3 text-right text-xs font-bold uppercase tracking-wider text-apple-text-muted"
                >
                  {t('admin.modules.tableActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {modulesQuery.loading &&
                [0, 1, 2].map((index) => (
                  <tr key={index} className="border-b border-apple-border/60">
                    <td colSpan={4} className="py-5">
                      <div className="h-8 animate-pulse rounded-lg bg-apple-blue-light/40" />
                    </td>
                  </tr>
                ))}

              {!modulesQuery.loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <p className="text-sm text-apple-text-secondary">
                      {semester
                        ? t('admin.modules.emptySemester')
                        : t('admin.modules.emptyAll')}
                    </p>
                  </td>
                </tr>
              )}

              {!modulesQuery.loading &&
                rows.map((module) => (
                  <tr
                    key={module.id}
                    className="border-b border-apple-border/60 transition-colors duration-200 hover:bg-signal-light/40"
                  >
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center rounded-full border border-apple-border bg-apple-bg px-3 py-1 text-xs font-semibold text-apple-text-primary">
                        {module.semesterName ?? '—'}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-sm font-semibold text-apple-text-primary">
                        {module.title}
                      </p>
                      <p className="mt-0.5 text-xs text-apple-text-muted">
                        {module.code}
                      </p>
                    </td>
                    <td className="py-4 pr-4 text-sm text-apple-text-secondary">
                      {module.resourceCount}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(module)}
                          disabled={busyId === module.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-secondary transition-colors duration-200 hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary disabled:opacity-50"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          {t('admin.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(module)}
                          disabled={busyId === module.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-primary transition-colors duration-200 hover:border-black hover:bg-apple-blue-light/50 disabled:opacity-50"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditModuleModal
          module={editing}
          onClose={() => setEditing(null)}
          onSave={async (title) => {
            await mutations.editModule(editing.id, { title })
            setEditing(null)
            setCreateSuccess(t('admin.modules.updated'))
            onChanged?.()
          }}
        />
      )}
    </div>
  )
}

function EditModuleModal({
  module,
  onClose,
  onSave,
}: {
  module: AdminModule
  onClose: () => void
  onSave: (title: string) => Promise<void>
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState(module.title)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      await onSave(title.trim())
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : t('admin.modules.genericError'),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-apple-text-primary/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-apple-border bg-apple-card p-8 shadow-2xl">
        <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
          {t('admin.modules.editTitle')}
        </h3>
        <p className="mt-2 text-xs text-apple-text-secondary">
          {t('admin.modules.editDescription')}
        </p>

        <div className="mt-6">
          <label htmlFor="em-module-name" className={labelClasses}>
            {t('admin.modules.fieldName')}
          </label>
          <input
            id="em-module-name"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            className={inputClasses}
          />
        </div>

        {saveError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-apple-border bg-apple-blue-light/50 px-4 py-3 text-xs font-semibold text-apple-text-primary"
          >
            {saveError}
          </p>
        )}

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
            disabled={saving || title.trim().length < 3}
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
