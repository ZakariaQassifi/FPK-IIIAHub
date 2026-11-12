import { useState } from 'react'
import { CalendarIcon, FileTextIcon, UploadIcon } from '@/components/icons'
import { useAdminMutations, useAdminTimetables } from '@/hooks/useAdmin'
import { useIiiaSemesters } from '@/hooks/useLibrary'
import { useI18n } from '@/i18n'
import { formatDate } from '@/lib/utils'
import type { SemesterSlug } from '@/types/iiia'

const MAX_FILE_SIZE = 25 * 1024 * 1024
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [
  `${CURRENT_YEAR - 1}/${CURRENT_YEAR}`,
  `${CURRENT_YEAR}/${CURRENT_YEAR + 1}`,
  `${CURRENT_YEAR + 1}/${CURRENT_YEAR + 2}`,
]

const inputClasses =
  'w-full rounded-xl border border-apple-border bg-apple-card px-3.5 py-2.5 text-sm text-apple-text-primary transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20'

const labelClasses =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-apple-text-secondary'

interface TimetableManagerProps {
  token: string
  onChanged?: () => void
}

export function TimetableManager({ token, onChanged }: TimetableManagerProps) {
  const { t, locale } = useI18n()
  const semestersQuery = useIiiaSemesters()
  const semesters = semestersQuery.data ?? []

  const timetablesQuery = useAdminTimetables(token)
  const timetables = timetablesQuery.data ?? []

  const [semesterSlug, setSemesterSlug] = useState<SemesterSlug | ''>('')
  const [academicYear, setAcademicYear] = useState(YEAR_OPTIONS[1])
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const mutations = useAdminMutations(token)

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

    const semester = semesters.find((s) => s.slug === semesterSlug)
    if (!semester) {
      setUploadError('Veuillez sélectionner un semestre.')
      return
    }
    if (!file) {
      setUploadError('Veuillez choisir un fichier PDF.')
      return
    }

    setUploading(true)
    try {
      await mutations.uploadTimetableFile({
        semesterId: semester.id,
        academicYear,
        file,
      })
      setUploadSuccess(true)
      setFile(null)
      onChanged?.()
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

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(t('admin.deleteTimetableConfirm', { label }))) return
    setBusyId(id)
    try {
      await mutations.deleteTimetable(id)
      onChanged?.()
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Erreur inconnue.',
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
        <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
          {t('admin.uploadTimetableTitle')}
        </h3>
        <p className="mt-2 max-w-md text-sm text-apple-text-secondary">
          {t('admin.uploadTimetableDescription')}
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label htmlFor="tt-semester" className={labelClasses}>
              {t('admin.fieldSemester')}
            </label>
            <select
              id="tt-semester"
              value={semesterSlug}
              onChange={(event) => {
                setSemesterSlug(event.target.value as SemesterSlug | '')
                setUploadSuccess(false)
              }}
              className={inputClasses}
            >
              <option value="">
                {semestersQuery.loading
                  ? t('admin.loading')
                  : t('admin.selectSemester')}
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

          <div>
            <label htmlFor="tt-year" className={labelClasses}>
              {t('admin.fieldAcademicYear')}
            </label>
            <select
              id="tt-year"
              value={academicYear}
              onChange={(event) => {
                setAcademicYear(event.target.value)
                setUploadSuccess(false)
              }}
              className={inputClasses}
            >
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tt-file" className={labelClasses}>
              {t('admin.fieldFile')}
            </label>
            <input
              id="tt-file"
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
          <p className="mt-5 rounded-xl border border-apple-border bg-apple-blue-light/40 px-4 py-3 text-xs font-medium text-apple-text-primary">
            {uploadError}
          </p>
        )}
        {uploadSuccess && (
          <p className="mt-5 rounded-xl border border-signal-light bg-signal-light px-4 py-3 text-xs font-medium text-apple-text-primary">
            {t('admin.timetableSuccess')}
          </p>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !semesterSlug || !file}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-signal-light bg-signal-light px-6 py-3 text-sm font-semibold text-apple-text-primary shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-95 hover:shadow-md"
        >
          <UploadIcon className="h-4 w-4" />
          {uploading ? t('admin.uploading') : t('admin.publishTimetable')}
        </button>
      </div>

      <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
        <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
          {t('admin.publishedTimetables')}
        </h3>

        <div className="mt-6 space-y-3">
          {timetablesQuery.loading &&
            [0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-apple-blue-light/40"
              />
            ))}

          {!timetablesQuery.loading && timetables.length === 0 && (
            <p className="rounded-xl border border-dashed border-apple-border p-8 text-center text-sm text-apple-text-secondary">
              {t('admin.noTimetables')}
            </p>
          )}

          {!timetablesQuery.loading &&
            timetables.map((timetable) => (
              <div
                key={timetable.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-apple-border bg-apple-bg p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apple-blue-light text-apple-text-primary">
                    <FileTextIcon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-apple-text-primary">
                      {timetable.semesterName ?? '—'}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-apple-text-secondary">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {timetable.academicYear} ·{' '}
                      {formatDate(timetable.updatedAt, locale)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      timetable.id,
                      timetable.semesterName ?? timetable.id,
                    )
                  }
                  disabled={busyId === timetable.id}
                  className="shrink-0 rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-primary transition-colors hover:border-black hover:bg-apple-blue-light/40 disabled:opacity-50"
                >
                  {t('admin.delete')}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
