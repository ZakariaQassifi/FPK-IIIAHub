import { useMemo, useState } from 'react'
import { UploadIcon } from '@/components/icons'
import { useAdminModules, useAdminMutations } from '@/hooks/useAdmin'
import { useIiiaSemesters } from '@/hooks/useLibrary'
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
  { label: 'Others', value: 'OTHERS' },
]

const inputClasses =
  'w-full rounded-xl border border-apple-border bg-apple-card px-3.5 py-2.5 text-sm text-apple-text-primary placeholder:text-apple-text-muted transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20'

const labelClasses =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-apple-text-secondary'

interface ResourceUploadManagerProps {
  token: string
  version?: number
  onUploaded?: () => void
}

export function ResourceUploadManager({
  token,
  version = 0,
  onUploaded,
}: ResourceUploadManagerProps) {
  const { t } = useI18n()
  const semestersQuery = useIiiaSemesters()
  const semesters = semestersQuery.data ?? []

  const [semesterSlug, setSemesterSlug] = useState<SemesterSlug | ''>('')
  const [semesterId, setSemesterId] = useState('')
  const [moduleMode, setModuleMode] = useState<'existing' | 'new'>('existing')
  const [moduleId, setModuleId] = useState('')
  const [moduleName, setModuleName] = useState('')
  const [moduleCode, setModuleCode] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('COURS')
  const [academicYear, setAcademicYear] = useState(YEAR_OPTIONS[1])
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const modulesQuery = useAdminModules(token, semesterId || undefined, version)
  const modules = useMemo(
    () =>
      (modulesQuery.data ?? []).filter(
        (module) => !semesterId || module.semesterId === semesterId,
      ),
    [modulesQuery.data, semesterId],
  )

  const mutations = useAdminMutations(token)

  function handleSemesterChange(value: string) {
    setSemesterSlug(value as SemesterSlug | '')
    const semester = semesters.find((s) => s.slug === value)
    setSemesterId(semester?.id ?? '')
    setModuleId('')
    setUploadSuccess(false)
  }

  function handleFileChange(nextFile: File | undefined) {
    setUploadSuccess(false)
    if (!nextFile) return

    if (!(nextFile.type === 'application/pdf' && /\.pdf$/i.test(nextFile.name))) {
      setFile(null)
      setFileError('Seuls les fichiers PDF sont acceptés.')
      return
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setFileError('Fichier trop volumineux : la taille maximale est de 25 Mo.')
      return
    }
    setFile(nextFile)
    setFileError(null)
  }

  async function handleUpload() {
    setUploadError(null)
    setUploadSuccess(false)

    if (!semesterSlug) {
      setUploadError('Veuillez sélectionner un semestre.')
      return
    }
    if (moduleMode === 'existing' && !moduleId) {
      setUploadError('Veuillez sélectionner un module.')
      return
    }
    if (moduleMode === 'new' && moduleName.trim().length < 3) {
      setUploadError('Veuillez saisir le nom du nouveau module.')
      return
    }
    if (title.trim().length < 3) {
      setUploadError('Veuillez saisir un titre de document.')
      return
    }
    if (!file) {
      setUploadError('Veuillez choisir un fichier PDF.')
      return
    }

    setUploading(true)
    try {
      await mutations.uploadResourceFile({
        title: title.trim(),
        category,
        academicYear,
        moduleId: moduleMode === 'existing' ? moduleId : undefined,
        moduleName: moduleMode === 'new' ? moduleName.trim() : undefined,
        moduleCode: moduleMode === 'new' ? moduleCode.trim() : undefined,
        semesterId: moduleMode === 'new' ? semesterId : undefined,
        professorName: '',
        file,
      })
      setUploadSuccess(true)
      setFile(null)
      setTitle('')
      setModuleName('')
      setModuleCode('')
      onUploaded?.()
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise en ligne.',
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
      <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
        {t('admin.uploadResourceTitle')}
      </h3>
      <p className="mt-2 max-w-md text-sm text-apple-text-secondary">
        {t('admin.uploadResourceDescription')}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Field 1 — Semester */}
        <div>
          <label htmlFor="ru-semester" className={labelClasses}>
            {t('admin.fieldSemester')}
          </label>
          <select
            id="ru-semester"
            value={semesterSlug}
            onChange={(event) => handleSemesterChange(event.target.value)}
            className={inputClasses}
          >
            <option value="">
              {semestersQuery.loading
                ? t('admin.loading')
                : t('admin.selectSemester')}
            </option>
            {semesters.map((semester) => (
              <option key={semester.slug} value={semester.slug}>
                {semester.label} — {semester.level === 'LICENCE' ? t('semester.licence') : t('semester.master')}
              </option>
            ))}
          </select>
        </div>

        {/* Field 2 — Module (select or type) */}
        <div>
          <label htmlFor="ru-module-mode" className={labelClasses}>
            {t('admin.fieldModule')}
          </label>
          <div className="mb-2 flex gap-2">
            <button
              type="button"
              onClick={() => setModuleMode('existing')}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                moduleMode === 'existing'
                  ? 'border-signal-light bg-signal-light text-apple-text-primary'
                  : 'border-apple-border bg-apple-card text-apple-text-secondary hover:border-signal-light'
              }`}
            >
              {t('admin.moduleExisting')}
            </button>
            <button
              type="button"
              onClick={() => setModuleMode('new')}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                moduleMode === 'new'
                  ? 'border-signal-light bg-signal-light text-apple-text-primary'
                  : 'border-apple-border bg-apple-card text-apple-text-secondary hover:border-signal-light'
              }`}
            >
              {t('admin.moduleNew')}
            </button>
          </div>

          {moduleMode === 'existing' ? (
            <select
              id="ru-module"
              value={moduleId}
              onChange={(event) => {
                setModuleId(event.target.value)
                setUploadSuccess(false)
              }}
              className={inputClasses}
              disabled={!semesterSlug}
            >
              <option value="">
                {!semesterSlug
                  ? t('admin.selectSemesterFirst')
                  : modulesQuery.loading
                    ? t('admin.loading')
                    : t('admin.selectModule')}
              </option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.code} — {module.title}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-3">
              <input
                id="ru-module-name"
                type="text"
                value={moduleName}
                onChange={(event) => setModuleName(event.target.value)}
                maxLength={200}
                placeholder={t('admin.moduleNamePlaceholder')}
                className={inputClasses}
              />
              <input
                id="ru-module-code"
                type="text"
                value={moduleCode}
                onChange={(event) => setModuleCode(event.target.value)}
                maxLength={30}
                placeholder={t('admin.moduleCodePlaceholder')}
                className={inputClasses}
              />
            </div>
          )}
        </div>

        {/* Field 3 — Category */}
        <div>
          <label htmlFor="ru-category" className={labelClasses}>
            {t('admin.fieldCategory')}
          </label>
          <select
            id="ru-category"
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
          <label htmlFor="ru-year" className={labelClasses}>
            {t('admin.fieldAcademicYear')}
          </label>
          <select
            id="ru-year"
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

        {/* Title */}
        <div className="lg:col-span-2">
          <label htmlFor="ru-title" className={labelClasses}>
            {t('admin.fieldTitle')}
          </label>
          <input
            id="ru-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            placeholder={t('admin.titlePlaceholder')}
            className={inputClasses}
          />
        </div>

        {/* Field 4 — PDF upload */}
        <div className="lg:col-span-2">
          <label htmlFor="ru-file" className={labelClasses}>
            {t('admin.fieldFile')}
          </label>
          <input
            id="ru-file"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => handleFileChange(event.target.files?.[0])}
            className="w-full cursor-pointer rounded-xl border border-apple-border bg-apple-card px-3.5 py-2.5 text-sm text-apple-text-secondary file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-signal-light file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-apple-text-primary hover:file:bg-signal-light/70 transition-all"
          />
          {fileError && (
            <p className="mt-2 text-xs font-medium text-apple-text-primary">
              {fileError}
            </p>
          )}
        </div>
      </div>

      {uploadError && (
        <p className="mt-6 rounded-xl border border-apple-border bg-apple-blue-light/40 px-4 py-3 text-xs font-medium text-apple-text-primary">
          {uploadError}
        </p>
      )}
      {uploadSuccess && (
        <p className="mt-6 rounded-xl border border-signal-light bg-signal-light px-4 py-3 text-xs font-medium text-apple-text-primary">
          {t('admin.uploadSuccess')}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading || !semesterSlug || !file}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-signal-light bg-signal-light px-6 py-3 text-sm font-semibold text-apple-text-primary shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-95 hover:shadow-md"
      >
        <UploadIcon className="h-4 w-4" />
        {uploading ? t('admin.uploading') : t('admin.publishResource')}
      </button>
    </div>
  )
}
