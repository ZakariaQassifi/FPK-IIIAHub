import { Link } from 'react-router-dom'
import { GraduationCapIcon } from '@/components/icons'

const ACADEMIC_LINKS = [
  { label: 'Filières', to: '/fields' },
  { label: 'Ressources', to: '/#resources' },
  { label: 'Annonces', to: '/#announcements' },
  { label: 'Emplois du temps', to: '/fields' },
]

const PLATFORM_LINKS = [
  { label: 'Contribuer', to: '/contribute' },
  { label: 'Mes soumissions', to: '/my-submissions' },
  { label: 'À propos du projet', to: '/' },
]

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {

  return (
    <footer className="border-t border-white/10 bg-accent text-apple-text-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
                <GraduationCapIcon className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                FPK{' '}
                <span className="text-accent">Academic Hub</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-apple-text-muted">
              Plateforme académique communautaire de la Faculté
              Polydisciplinaire de Khouribga : ressources pédagogiques, emplois
              du temps et annonces officielles pour les étudiants et
              professeurs.
            </p>
          </div>

          <nav aria-label="Liens académiques">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-text-muted">
              Liens académiques
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {ACADEMIC_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-signal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Plateforme">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-text-muted">
              Plateforme
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-signal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs leading-relaxed text-apple-text-muted">
            Avertissement : projet étudiant indépendant, non affilié
            officiellement à l'Université Hassan Premier. Les documents sont
            fournis à titre informatif ; reportez-vous toujours au contenu
            officiel de vos professeurs.
          </p>
          <p className="mt-3 text-xs text-apple-text-muted">
            © {CURRENT_YEAR} FPK Academic Hub. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
