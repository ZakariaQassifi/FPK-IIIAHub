import { useCallback, useState } from 'react'
import type { Announcement } from '@/types'
import { NotFoundMessage, RowSkeleton } from '@/components/feedback'
import { Toast, type ToastTone } from '@/components/ui/Toast'
import {
  CalendarIcon,
  CloseIcon,
  MegaphoneIcon,
  PinIcon,
} from '@/components/icons'

const inputClasses =
  'w-full rounded-xl border border-apple-border bg-apple-card px-3.5 py-2.5 text-sm text-apple-text-primary placeholder:text-apple-text-muted transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20'

const labelClasses =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-apple-text-secondary'

/**
 * Categories accepted by the backend (table `announcements.category`).
 * They mirror the IIIAAnnouncement type so the homepage badge always
 * resolves to the right style.
 */
const CATEGORY_OPTIONS = [
  { value: 'EXAMEN', label: 'Examen' },
  { value: 'ADMINISTRATIF', label: 'Administratif' },
  { value: 'PEDAGOGIQUE', label: 'Pédagogique' },
  { value: 'GENERAL', label: 'Général' },
] as const

const DEFAULT_CATEGORY = 'GENERAL'

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_EXPIRY = `${CURRENT_YEAR + 1}-06-30`
void DEFAULT_EXPIRY

interface AnnouncementsManagerProps {
  announcements: Announcement[]
  loading: boolean
  error: string | null
  onCreate: (payload: {
    title: string
    content: string
    category: string
    isPinned: boolean
    expiresAt: string | null
  }) => Promise<void>
  onUpdate: (
    id: string,
    payload: {
      isPinned?: boolean
      title?: string
      content?: string
      category?: string
      expiresAt?: string | null
      clearExpiry?: boolean
    },
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

interface FormState {
  id: string | null
  title: string
  content: string
  category: string
  isPinned: boolean
  expiryDate: string
}

interface ToastState {
  tone: ToastTone
  title: string
  description?: string
}

function toFormState(announcement: Announcement | null): FormState {
  return {
    id: announcement?.id ?? null,
    title: announcement?.title ?? '',
    content: announcement?.content ?? '',
    category: announcement?.category ?? DEFAULT_CATEGORY,
    isPinned: announcement?.isPinned ?? false,
    expiryDate: announcement?.expiresAt
      ? announcement.expiresAt.slice(0, 10)
      : '',
  }
}

/** Extract the most precise message available from a failed request. */
function describeError(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message
  }
  if (typeof err === 'string' && err.trim()) {
    return err
  }
  return 'Erreur inconnue lors de la sauvegarde.'
}

export function AnnouncementsManager({
  announcements,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: AnnouncementsManagerProps) {
  const [form, setForm] = useState<FormState>(toFormState(null))
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const dismissToast = useCallback(() => setToast(null), [])

  function patchForm(partial: Partial<FormState>) {
    setForm((current) => ({ ...current, ...partial }))
    setFormError(null)
  }

  async function handleSubmit() {
    setFormError(null)

    if (form.title.trim().length < 3) {
      setFormError('Le titre doit contenir au moins 3 caractères.')
      return
    }
    if (form.content.trim().length < 10) {
      setFormError('Le contenu doit contenir au moins 10 caractères.')
      return
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category || DEFAULT_CATEGORY,
      isPinned: form.isPinned,
      expiresAt: form.expiryDate ? `${form.expiryDate}T23:59:59Z` : null,
    }

    try {
      if (form.id) {
        await onUpdate(form.id, {
          title: payload.title,
          content: payload.content,
          category: payload.category,
          isPinned: payload.isPinned,
          expiresAt: payload.expiresAt,
          clearExpiry: !form.expiryDate,
        })
        setToast({
          tone: 'success',
          title: 'Annonce mise à jour',
          description: payload.title,
        })
      } else {
        await onCreate(payload)
        setToast({
          tone: 'success',
          title: 'Annonce publiée',
          description: payload.title,
        })
      }

      // Reset every field for the next announcement
      setForm(toFormState(null))
      setFormError(null)
    } catch (err) {
      const message = describeError(err)
      setFormError(message)
      setToast({
        tone: 'error',
        title: 'Échec de la publication',
        description: message,
      })
    }
  }

  async function togglePin(announcement: Announcement) {
    setBusyId(announcement.id)
    setActionError(null)
    try {
      await onUpdate(announcement.id, { isPinned: !announcement.isPinned })
      setToast({
        tone: 'success',
        title: announcement.isPinned
          ? 'Annonce désépinglée'
          : 'Annonce épinglée',
        description: announcement.title,
      })
    } catch (err) {
      const message = describeError(err)
      setActionError(message)
      setToast({
        tone: 'error',
        title: 'Échec de l’opération',
        description: message,
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(announcement: Announcement) {
    if (!window.confirm(`Supprimer l'annonce « ${announcement.title} » ?`)) {
      return
    }
    setBusyId(announcement.id)
    setActionError(null)
    try {
      await onDelete(announcement.id)
      if (form.id === announcement.id) setForm(toFormState(null))
      setToast({
        tone: 'success',
        title: 'Annonce supprimée',
        description: announcement.title,
      })
    } catch (err) {
      const message = describeError(err)
      setActionError(message)
      setToast({
        tone: 'error',
        title: 'Échec de la suppression',
        description: message,
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
            {form.id ? "Modifier l'annonce" : 'Nouvelle annonce'}
          </h3>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(toFormState(null))}
              className="inline-flex items-center gap-1 text-xs font-semibold text-apple-text-muted transition-colors hover:text-apple-text-primary"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              Annuler l'édition
            </button>
          )}
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="ann-title" className={labelClasses}>
              Titre
            </label>
            <input
              id="ann-title"
              type="text"
              value={form.title}
              onChange={(event) => patchForm({ title: event.target.value })}
              maxLength={200}
              placeholder="Ex : Examens du semestre 3 : planning publié"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="ann-content" className={labelClasses}>
              Contenu
            </label>
            <textarea
              id="ann-content"
              value={form.content}
              onChange={(event) => patchForm({ content: event.target.value })}
              maxLength={2000}
              rows={5}
              placeholder="Détails de l'annonce…"
              className={`${inputClasses} resize-y`}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ann-category" className={labelClasses}>
                Catégorie
              </label>
              <select
                id="ann-category"
                value={form.category}
                onChange={(event) => patchForm({ category: event.target.value })}
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
              <label htmlFor="ann-expiry" className={labelClasses}>
                Expire le <span className="font-normal normal-case">(optionnel)</span>
              </label>
              <input
                id="ann-expiry"
                type="date"
                value={form.expiryDate}
                min={`${CURRENT_YEAR}-01-01`}
                max={`${CURRENT_YEAR + 2}-12-31`}
                onChange={(event) => patchForm({ expiryDate: event.target.value })}
                className={inputClasses}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-apple-text-secondary">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(event) => patchForm({ isPinned: event.target.checked })}
              className="h-4 w-4 rounded border-apple-border text-apple-blue focus:ring-apple-blue"
            />
            Épingler en haut de la page d'accueil
          </label>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium leading-relaxed text-rose-700"
            >
              {formError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-signal-light bg-signal-light px-5 py-3 text-sm font-semibold text-apple-text-primary shadow-sm transition-all duration-200 hover:brightness-95 hover:shadow-md"
          >
            <MegaphoneIcon className="h-4 w-4" />
            {form.id ? 'Enregistrer les modifications' : "Publier l'annonce"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold tracking-tight text-apple-text-primary">
          Annonces publiées
        </h3>

        {actionError && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium leading-relaxed text-rose-700"
          >
            {actionError}
          </p>
        )}

        <div className="mt-4 space-y-3">
          {loading &&
            [0, 1, 2].map((index) => <RowSkeleton key={index} />)}

          {!loading && error && (
            <NotFoundMessage
              title="Impossible de charger les annonces"
              description={error}
            />
          )}

          {!loading && !error && announcements.length === 0 && (
            <NotFoundMessage
              title="Aucune annonce"
              description="Créez votre première annonce pour informer les étudiants."
            />
          )}

          {!loading &&
            !error &&
            announcements.map((announcement) => (
              <article
                key={announcement.id}
                className={`rounded-2xl border p-5 shadow-sm transition-all ${
                  announcement.isPinned
                    ? 'border-signal-light bg-signal-light/40'
                    : 'border-apple-border bg-apple-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-apple-blue-light px-2 py-0.5 text-xs font-medium text-apple-text-primary">
                      {announcement.category}
                    </span>
                    {announcement.isPinned && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-apple-text-secondary">
                        <PinIcon className="h-3.5 w-3.5" />
                        Épinglée
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-apple-text-muted">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {new Intl.DateTimeFormat('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    }).format(new Date(announcement.publishedAt))}
                  </span>
                </div>

                <h4 className="mt-3 text-sm font-semibold text-apple-text-primary">
                  {announcement.title}
                </h4>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-apple-text-secondary">
                  {announcement.content}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => togglePin(announcement)}
                    disabled={busyId === announcement.id}
                    className="rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-secondary transition-colors hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary disabled:opacity-50"
                  >
                    {announcement.isPinned ? 'Désépingler' : 'Épingler'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(toFormState(announcement))}
                    className="rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-secondary transition-colors hover:border-signal-light hover:bg-signal-light hover:text-apple-text-primary"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(announcement)}
                    disabled={busyId === announcement.id}
                    className="rounded-lg border border-apple-border px-3 py-1.5 text-xs font-semibold text-apple-text-primary transition-colors hover:border-black hover:bg-apple-blue-light/40 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
        </div>
      </div>

      {toast && (
        <Toast
          tone={toast.tone}
          title={toast.title}
          description={toast.description}
          onDismiss={dismissToast}
        />
      )}
    </div>
  )
}
