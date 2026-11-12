import { Link } from 'react-router-dom'
import { ArrowRightIcon, GraduationCapIcon } from '@/components/icons'

export function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-apple-bg px-4 py-16">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-black/25">
          <GraduationCapIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-apple-text-primary">
          404
        </h1>
        <p className="mt-3 max-w-md text-sm text-apple-text-secondary sm:text-base">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-signal-light px-6 py-3 text-sm font-semibold text-apple-text-primary shadow-lg shadow-black/30 transition-all hover:brightness-95"
        >
          Retour à l'accueil
          <ArrowRightIcon className="h-4.5 w-4.5" />
        </Link>
      </div>
    </section>
  )
}
