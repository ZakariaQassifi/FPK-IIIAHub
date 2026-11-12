import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link } from 'react-router-dom'
import {
  CloseIcon,
  GraduationCapIcon,
  GoogleIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from '@/components/icons'

const NAV_LINKS = [
  { label: 'Filières', to: '/fields' },
  { label: 'Annonces', to: '/#announcements' },
  { label: 'Contribuer', to: '/contribute' },
]

const AUTH_LINKS = [{ label: 'Mes soumissions', to: '/my-submissions' }]

interface NavbarProps {
  session: Session | null
  onSignIn: () => void
  onSignOut: () => void
  signInError: string | null
  onDismissError: () => void
  isDark: boolean
  onToggleDark: () => void
}

export function Navbar({
  session,
  onSignIn,
  onSignOut,
  signInError,
  onDismissError,
  isDark,
  onToggleDark,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const user = session?.user ?? null
  const links = user ? [...NAV_LINKS, ...AUTH_LINKS] : NAV_LINKS
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ?? undefined
  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ?? undefined

  useEffect(() => {
    if (!signInError) return
    const timer = window.setTimeout(onDismissError, 7000)
    return () => window.clearTimeout(timer)
  }, [signInError, onDismissError])

  return (
    <header className="sticky top-0 z-50 border-b border-apple-border/70 bg-apple-card/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-md shadow-black/20">
            <GraduationCapIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-apple-text-primary">
            FPK <span className="text-accent">Academic Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-apple-text-secondary transition-colors hover:bg-signal-light hover:text-apple-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-apple-text-secondary transition-colors hover:bg-signal-light hover:text-apple-text-primary"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName ?? 'Utilisateur'}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full border border-apple-border object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                  {(fullName ?? 'U').charAt(0).toUpperCase()}
                </span>
              )}
              {fullName && (
                <span className="max-w-32 truncate text-sm font-medium text-apple-text-primary">
                  {fullName}
                </span>
              )}
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-lg border border-apple-border px-3 py-1.5 text-sm font-medium text-apple-text-primary transition-colors hover:bg-signal-light"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="hidden items-center gap-2 rounded-lg bg-signal-light px-4 py-2 text-sm font-semibold text-apple-text-primary shadow-md shadow-black/25 transition-all hover:shadow-lg hover:shadow-black/30 hover:brightness-95 md:inline-flex"
            >
              <GoogleIcon className="h-4 w-4" />
              Se connecter
            </button>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-apple-text-secondary transition-colors hover:bg-signal-light md:hidden"
          >
            {menuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-apple-border/70 bg-apple-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-apple-text-primary transition-colors hover:bg-signal-light"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-apple-border/70 pt-3">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName ?? 'Utilisateur'}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full border border-apple-border object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                      {(fullName ?? 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                  {fullName && (
                    <span className="max-w-40 truncate text-sm font-medium text-apple-text-primary">
                      {fullName}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-lg border border-apple-border px-3 py-1.5 text-sm font-medium text-apple-text-primary"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-signal-light px-4 py-2.5 text-sm font-semibold text-apple-text-primary"
              >
                <GoogleIcon className="h-4 w-4" />
                Se connecter avec Google
              </button>
            )}
          </div>
        </div>
      )}

      {signInError && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-xl border border-accent-soft bg-accent-soft p-4 shadow-lg"
        >
          <p className="flex-1 text-sm text-apple-text-primary">
            {signInError}
          </p>
          <button
            type="button"
            onClick={onDismissError}
            aria-label="Fermer"
            className="text-accent transition-colors hover:text-apple-text-primary"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  )
}
