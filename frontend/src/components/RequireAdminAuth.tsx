import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldIcon } from '@/components/icons'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-apple-bg">
        <span
          aria-label="Chargement"
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent-soft border-t-accent"
        />
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-apple-bg px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-apple-border bg-apple-card p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft p-2 text-accent shadow-lg shadow-accent/25">
            <ShieldIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-apple-text-primary">
            Administration FPK IIIA
          </h1>
          <p className="mt-3 text-sm text-apple-text-secondary">
            Connectez-vous avec un compte administrateur pour accéder au panneau
            de modération.
          </p>
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-signal-light px-5 py-3 text-sm font-semibold text-apple-text-primary shadow-lg shadow-accent/30 transition-all hover:brightness-95"
          >
            <ShieldIcon className="h-4.5 w-4.5" />
            Se connecter en tant qu'admin
          </button>
        </div>
      </section>
    )
  }

  return <>{children}</>
}

export function RequireAdminAuthOrLogin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-apple-bg">
        <span
          aria-label="Chargement"
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent-soft border-t-accent"
        />
      </section>
    )
  }

  if (!isAuthenticated) {
    navigate('/admin/login', { replace: true })
    return null
  }

  return <>{children}</>
}
