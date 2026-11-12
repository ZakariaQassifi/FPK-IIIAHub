import type { ReactNode } from 'react'
import { GraduationCapIcon, GoogleIcon } from '@/components/icons'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, initializing, signInError, signInWithGoogle } = useAuth()

  if (initializing) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-apple-bg">
        <span
          aria-label="Chargement"
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent-soft border-t-accent"
        />
      </section>
    )
  }

  if (!session) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-apple-bg px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-apple-border bg-apple-card p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-black/25">
            <GraduationCapIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-xl font-bold text-apple-text-primary">
            Connexion requise
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-apple-text-secondary">
            Cette espace est réservé aux membres connectés de la communauté
            FPK. Connectez-vous avec votre compte Google pour proposer des
            documents et suivre vos soumissions.
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-signal-light px-5 py-3 text-sm font-semibold text-apple-text-primary shadow-lg shadow-black/30 transition-all hover:brightness-95"
          >
            <GoogleIcon className="h-4.5 w-4.5" />
            Se connecter avec Google
          </button>
          {signInError && (
            <p className="mt-3 text-xs text-apple-text-primary">
              {signInError}
            </p>
          )}
        </div>
      </section>
    )
  }

  return <>{children}</>
}
