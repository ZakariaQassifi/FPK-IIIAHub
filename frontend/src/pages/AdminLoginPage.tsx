import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldIcon } from '@/components/icons'
import { adminLogin } from '@/api/auth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await adminLogin({ username, password })
      localStorage.setItem('fpk_admin_token', response.access_token)
      localStorage.setItem('fpk_admin_role', 'ADMIN')
      navigate('/admin', { replace: true })
    } catch (err: any) {
      setError(
        err?.message ||
        'Identifiant ou mot de passe incorrect. Vérifiez vos credentials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-apple-bg px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft p-2 text-accent shadow-lg shadow-accent/25">
          <ShieldIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-apple-text-primary">
          Administration FPK IIIA
        </h1>
        <p className="mt-3 text-sm text-apple-text-secondary">
          Connectez-vous avec vos credentials administrateur pour accéder au
          panneau de modération.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="text-left">
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-apple-text-muted mb-2"
            >
              Identifiant ou e-mail
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-apple-border bg-apple-bg px-4 py-3 text-sm text-apple-text-primary focus:outline-none focus:ring-2 focus:ring-signal/30 focus:border-signal transition-all"
              placeholder="admin"
            />
          </div>

          <div className="text-left">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-apple-text-muted mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-apple-border bg-apple-bg px-4 py-3 text-sm text-apple-text-primary focus:outline-none focus:ring-2 focus:ring-signal/30 focus:border-signal transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-apple-text-primary">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-signal-light px-6 py-3 text-sm font-semibold text-apple-text-primary shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none hover:brightness-95 hover:shadow-md"
          >
            {isLoading ? (
              <span className="flex items-center">
                Connexion…
              </span>
            ) : (
              <>
                Se connecter
                <ShieldIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-xs text-apple-text-muted">
          Connexion réservée aux administrateurs de la plateforme.
        </p>
      </div>
    </section>
  )
}
