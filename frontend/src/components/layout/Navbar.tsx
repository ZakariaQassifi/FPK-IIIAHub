import { Link, useLocation } from 'react-router-dom'
import { MenuIcon, UploadIcon } from '@/components/icons'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

interface NavbarProps {
  session: { user: { email?: string | null } } | null
  onSignIn: () => void
  onSignOut: () => void
  signInError: string | null
  onDismissError: () => void
}

export function Navbar({
  session,
  onSignIn,
  onSignOut,
  signInError,
  onDismissError,
}: NavbarProps) {
  const location = useLocation()
  const { t } = useI18n()

  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.library'), to: '/library' },
    { label: t('nav.about'), to: '/about' },
  ]

  return (
    <header
      className="sticky top-0 z-40 border-b border-apple-border bg-apple-bg/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3"
            aria-label="FPK IIIA Academic Hub — Accueil"
          >
            <img
              src="/IIIA_Logo.jpg"
              alt="Logo du département Génie Informatique et Intelligence Artificielle — FPK Khouribga"
              className="h-10 w-auto rounded-lg object-contain"
            />
            <span className="font-bold leading-none text-apple-text-primary sm:text-xl">
              FPK IIIA<span className="text-apple-text-primary">Hub</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium leading-none transition-colors',
                  location.pathname === link.to
                    ? 'bg-signal-light text-apple-text-primary'
                    : 'text-apple-text-secondary hover:bg-signal-light hover:text-apple-text-primary',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/contribute"
              className="hidden h-9 items-center gap-2 rounded-xl border border-apple-border bg-apple-card px-4 text-xs font-semibold text-apple-text-primary transition-all duration-200 hover:border-signal-light hover:bg-signal-light lg:inline-flex"
            >
              <UploadIcon className="h-3.5 w-3.5" />
              {t('contribute.navLabel')}
            </Link>

            <LanguageSwitcher />

            {session ? (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex h-9 items-center rounded-xl border border-apple-border bg-signal-light/60 px-5 text-sm font-semibold leading-none text-apple-text-primary transition-colors hover:bg-signal-light"
              >
                {t('nav.signOut')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex h-9 items-center rounded-xl bg-signal-light px-5 text-sm font-semibold leading-none text-apple-text-primary shadow-sm transition-colors hover:brightness-95"
              >
                {t('nav.signIn')}
              </button>
            )}

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-signal-light text-apple-text-primary transition-colors hover:brightness-95 md:hidden"
              aria-label={t('nav.menu')}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {signInError && (
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div
            className="rounded-xl border border-accent/20 bg-signal-light/10 px-6 py-4 text-sm text-accent"
            role="alert"
          >
            {signInError}
            <button
              type="button"
              onClick={onDismissError}
              className="ml-3 inline underline decoration-accent/60 hover:decoration-accent"
            >
              {t('nav.dismiss')}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
