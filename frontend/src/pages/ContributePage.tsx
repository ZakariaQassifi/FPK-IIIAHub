import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeftIcon,
  ClockIcon,
  FileTextIcon,
  ShieldCheckIcon,
  UploadIcon,
  UsersIcon,
} from '@/components/icons'
import { submitContribution } from '@/api/contributions'
import { useIiiaModules, useIiiaSemesters } from '@/hooks/useLibrary'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import type { SemesterSlug } from '@/types/iiia'

const MAX_FILE_SIZE = 25 * 1024 * 1024
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [
  `${CURRENT_YEAR - 1}/${CURRENT_YEAR}`,
  `${CURRENT_YEAR}/${CURRENT_YEAR + 1}`,
  `${CURRENT_YEAR + 1}/${CURRENT_YEAR + 2}`,
]

const CATEGORY_OPTIONS = [
  { label: 'Cours', value: 'COURS' },
  { label: 'TD & TP', value: 'TD' },
  { label: 'Examens', value: 'EXAMS' },
  { label: 'Autres', value: 'OTHERS' },
]

const inputClasses =
  'w-full rounded-xl border border-apple-border bg-apple-card px-3.5 py-2.5 text-sm text-apple-text-primary placeholder:text-apple-text-muted transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20 disabled:cursor-not-allowed disabled:opacity-60'

const labelClasses =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-apple-text-secondary'

export function ContributePage() {
  const { t } = useI18n()
  const { session } = useAuth()

  const semestersQuery = useIiiaSemesters()
  const semesters = semestersQuery.data ?? []

  const [semesterSlug, setSemesterSlug] = useState<SemesterSlug | ''>('')
  const [moduleId, setModuleId] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('OTHERS')
  const [academicYear, setAcademicYear] = useState(YEAR_OPTIONS[1])
  const [contributorName, setContributorName] = useState('')
  const [contributorEmail, setContributorEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const modulesQuery = useIiiaModules(semesterSlug)
  const modules = useMemo(() => modulesQuery.data ?? [], [modulesQuery.data])

  // Prefill the identity from the signed-in account when it becomes
  // available. Adjusting state during render (rather than in an effect)
  // avoids a flash of an empty field.
  const [syncedEmail, setSyncedEmail] = useState<string | null>(null)
  const sessionEmail = session?.user?.email ?? ''
  if (sessionEmail && sessionEmail !== syncedEmail) {
    setSyncedEmail(sessionEmail)
    setContributorEmail((current) => (current ? current : sessionEmail))
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) setError(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [submitting])

  function handleFileChange(nextFile: File | undefined) {
    setSuccess(null)
    if (!nextFile) return

    const isPdf =
      nextFile.type === 'application/pdf' || /\.pdf$/i.test(nextFile.name)
    const isImage = nextFile.type.startsWith('image/')

    if (!isPdf && !isImage) {
      setFile(null)
      setFileError(t('contribute.errorFormat'))
      return
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setFileError(t('contribute.errorSize'))
      return
    }
    setFile(nextFile)
    setFileError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const semester = semesters.find((s) => s.slug === semesterSlug)
    if (!semester) {
      setError(t('contribute.errorSemester'))
      return
    }
    if (!moduleId) {
      setError(t('contribute.errorModule'))
      return
    }
    if (title.trim().length < 3) {
      setError(t('contribute.errorTitle'))
      return
    }
    if (!contributorName.trim() && !contributorEmail.trim()) {
      setError(t('contribute.errorContributor'))
      return
    }
    if (!file) {
      setError(t('contribute.errorFile'))
      return
    }

    setSubmitting(true)
    try {
      const created = await submitContribution({
        title: title.trim(),
        semesterId: semester.id,
        moduleId,
        category,
        academicYear,
        contributorName: contributorName.trim(),
        contributorEmail: contributorEmail.trim(),
        file,
      })

      setSuccess(
        t('contribute.success', {
          title: created.title,
          module: created.moduleCode ?? '',
        }),
      )

      // Reset the form for a second contribution.
      setSemesterSlug('')
      setModuleId('')
      setTitle('')
      setCategory('OTHERS')
      setAcademicYear(YEAR_OPTIONS[1])
      setFile(null)
      setFileError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('contribute.errorGeneric'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-apple-bg py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-3 rounded-xl border border-apple-border bg-apple-card px-5 py-3 text-sm font-semibold text-apple-text-secondary shadow-sm transition-all duration-200 hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {t('contribute.backHome')}
        </Link>

        {/* ---------------------------- Header ---------------------------- */}
        <div className="mt-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-apple-border bg-apple-blue-light px-4 py-2 text-xs font-semibold uppercase tracking-wider text-apple-text-primary">
            <UsersIcon className="h-3.5 w-3.5" />
            {t('contribute.eyebrow')}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-apple-text-primary sm:text-5xl">
            {t('contribute.title')}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-apple-text-secondary">
            {t('contribute.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* ---------------------- Explanatory column ---------------------- */}
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight text-apple-text-primary">
                {t('contribute.whyTitle')}
              </h2>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-apple-text-secondary">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{t('contribute.whyPoint1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{t('contribute.whyPoint2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{t('contribute.whyPoint3')}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-apple-text-primary">
                <ClockIcon className="h-5 w-5" />
                {t('contribute.processTitle')}
              </h2>
              <ol className="mt-5 space-y-4 text-sm leading-relaxed text-apple-text-secondary">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-apple-blue-light text-xs font-bold text-apple-text-primary">
                    1
                  </span>
                  <span>{t('contribute.processStep1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-apple-blue-light text-xs font-bold text-apple-text-primary">
                    2
                  </span>
                  <span>{t('contribute.processStep2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-apple-blue-light text-xs font-bold text-apple-text-primary">
                    3
                  </span>
                  <span>{t('contribute.processStep3')}</span>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-apple-border bg-apple-blue-light/40 p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-apple-text-primary">
                <ShieldCheckIcon className="h-5 w-5" />
                {t('contribute.rulesTitle')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-apple-text-secondary">
                {t('contribute.rules')}
              </p>
            </div>
          </aside>

          {/* --------------------------- Form column ------------------------ */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm"
            >
              <h2 className="text-lg font-bold tracking-tight text-apple-text-primary">
                {t('contribute.formTitle')}
              </h2>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {/* Identity */}
                <div>
                  <label htmlFor="ct-name" className={labelClasses}>
                    {t('contribute.fieldName')}
                  </label>
                  <input
                    id="ct-name"
                    type="text"
                    value={contributorName}
                    onChange={(event) => setContributorName(event.target.value)}
                    maxLength={120}
                    placeholder={t('contribute.namePlaceholder')}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="ct-email" className={labelClasses}>
                    {t('contribute.fieldEmail')}
                  </label>
                  <input
                    id="ct-email"
                    type="email"
                    value={contributorEmail}
                    onChange={(event) => setContributorEmail(event.target.value)}
                    maxLength={160}
                    placeholder="prenom.nom@uc.ac.ma"
                    className={inputClasses}
                  />
                  <p className="mt-1.5 text-xs text-apple-text-muted">
                    {t('contribute.emailHint')}
                  </p>
                </div>

                {/* Semester */}
                <div>
                  <label htmlFor="ct-semester" className={labelClasses}>
                    {t('contribute.fieldSemester')}
                  </label>
                  <select
                    id="ct-semester"
                    value={semesterSlug}
                    onChange={(event) => {
                      setSemesterSlug(event.target.value as SemesterSlug | '')
                      setModuleId('')
                      setSuccess(null)
                    }}
                    className={inputClasses}
                  >
                    <option value="">
                      {semestersQuery.loading
                        ? t('admin.loading')
                        : t('contribute.selectSemester')}
                    </option>
                    {semesters.map((semester) => (
                      <option key={semester.slug} value={semester.slug}>
                        {semester.label} —{' '}
                        {semester.level === 'LICENCE'
                          ? t('semester.licence')
                          : t('semester.master')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Module — filtered by the selected semester */}
                <div>
                  <label htmlFor="ct-module" className={labelClasses}>
                    {t('contribute.fieldModule')}
                  </label>
                  <select
                    id="ct-module"
                    value={moduleId}
                    onChange={(event) => {
                      setModuleId(event.target.value)
                      setSuccess(null)
                    }}
                    disabled={!semesterSlug}
                    className={inputClasses}
                  >
                    <option value="">
                      {!semesterSlug
                        ? t('contribute.selectSemesterFirst')
                        : modulesQuery.loading
                          ? t('admin.loading')
                          : t('contribute.selectModule')}
                    </option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.code} — {module.title}
                      </option>
                    ))}
                  </select>
                  {semesterSlug && !modulesQuery.loading && modules.length === 0 && (
                    <p className="mt-1.5 text-xs text-apple-text-muted">
                      {t('contribute.noModules')}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label htmlFor="ct-title" className={labelClasses}>
                    {t('contribute.fieldTitle')}
                  </label>
                  <input
                    id="ct-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={200}
                    placeholder={t('contribute.titlePlaceholder')}
                    className={inputClasses}
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="ct-category" className={labelClasses}>
                    {t('contribute.fieldCategory')}
                  </label>
                  <select
                    id="ct-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className={inputClasses}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic year */}
                <div>
                  <label htmlFor="ct-year" className={labelClasses}>
                    {t('contribute.fieldAcademicYear')}
                  </label>
                  <select
                    id="ct-year"
                    value={academicYear}
                    onChange={(event) => setAcademicYear(event.target.value)}
                    className={inputClasses}
                  >
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File */}
                <div className="sm:col-span-2">
                  <label htmlFor="ct-file" className={labelClasses}>
                    {t('contribute.fieldFile')}
                  </label>
                  <input
                    id="ct-file"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={(event) => handleFileChange(event.target.files?.[0])}
                    className="w-full cursor-pointer rounded-xl border border-apple-border bg-apple-card px-3.5 py-2.5 text-sm text-apple-text-secondary file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-apple-blue-light file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-apple-text-primary transition-all"
                  />
                  {fileError && (
                    <p className="mt-2 text-xs font-medium text-apple-text-primary">
                      {fileError}
                    </p>
                  )}
                  {file && (
                    <p className="mt-2 inline-flex items-center gap-2 text-xs text-apple-text-secondary">
                      <FileTextIcon className="h-3.5 w-3.5" />
                      {file.name}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-6 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium leading-relaxed text-rose-700"
                >
                  {error}
                </p>
              )}
              {success && (
                <p
                  role="status"
                  className="mt-6 rounded-xl border border-signal-light bg-signal-light px-4 py-3 text-xs font-medium leading-relaxed text-apple-text-primary"
                >
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-signal-light bg-signal-light px-6 py-3.5 text-sm font-semibold text-apple-text-primary shadow-sm transition-all duration-200 hover:brightness-95 disabled:opacity-50"
              >
                <UploadIcon className="h-4 w-4" />
                {submitting ? t('contribute.submitting') : t('contribute.submit')}
              </button>

              <p className="mt-4 text-center text-xs leading-relaxed text-apple-text-muted">
                {t('contribute.disclaimer')}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
