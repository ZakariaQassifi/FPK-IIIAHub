const API_URL = (
  import.meta.env.VITE_API_URL as string | undefined
)?.replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export class ApiNotConfiguredError extends Error {
  constructor() {
    super("L'URL de l'API n'est pas configurée (VITE_API_URL manquant).")
  }
}

interface ApiFetchInit extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit
  token?: string
}

export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiNotConfiguredError()
  }

  const headers = new Headers(init.headers)
  if (init.token) {
    headers.set('Authorization', `Bearer ${init.token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    throw new ApiError(await readErrorDetail(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError(
      `Réponse inattendue du serveur (${response.status}) : ${text.slice(0, 200)}`,
      response.status,
    )
  }
}

/**
 * Read the most precise error message available from a failed response.
 *
 * FastAPI returns `{ "detail": ... }` where detail may be a string or a list
 * of validation errors. Anything else (HTML error page, proxy error) falls
 * back to the raw body so the admin always sees what actually happened.
 */
async function readErrorDetail(response: Response): Promise<string> {
  let body = ''
  try {
    body = await response.text()
  } catch {
    body = ''
  }

  if (!body) {
    return `Erreur API (${response.status})`
  }

  try {
    const parsed = JSON.parse(body) as {
      detail?: unknown
      message?: unknown
      error?: unknown
    }

    const detail = parsed.detail ?? parsed.message ?? parsed.error

    if (typeof detail === 'string' && detail.trim()) {
      return detail.trim()
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object') {
            const entry = item as { msg?: string; loc?: unknown[] }
            const field = Array.isArray(entry.loc)
              ? entry.loc.filter((p) => p !== 'body').join('.')
              : ''
            return field ? `${field}: ${entry.msg ?? ''}`.trim() : entry.msg ?? ''
          }
          return String(item)
        })
        .filter(Boolean)
      if (messages.length) return messages.join(' · ')
    }

    if (detail && typeof detail === 'object') {
      return JSON.stringify(detail)
    }
  } catch {
    /* not JSON — fall through to the raw body */
  }

  return `Erreur API (${response.status}) : ${body.slice(0, 300)}`
}
