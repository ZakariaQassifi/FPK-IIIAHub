import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { PageTransitionOverlay, usePageTransition } from '@/components/layout/PageTransition'
import { RequireAuth } from '@/components/RequireAuth'
import { AdminPage } from '@/pages/AdminPage'
import { ContributePage } from '@/pages/ContributePage'
import { HomePage } from '@/pages/HomePage'
import { LibraryPage } from '@/pages/LibraryPage'
import { ModulePage } from '@/pages/ModulePage'
import { SemesterPage } from '@/pages/SemesterPage'
import { MySubmissionsPage } from '@/pages/MySubmissionsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { useAuth } from '@/hooks/useAuth'
import { AdminLoginPage } from '@/pages/AdminLoginPage'
import { AboutPage } from '@/pages/AboutPage'
import { RequireAdminAuth } from '@/components/RequireAdminAuth'

function ScrollHandler() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default function App() {
  const { session, signInError, setSignInError, signInWithGoogle, signOut } =
    useAuth()
  const { isTransitioning, startTransition } = usePageTransition()
  const location = useLocation()

  useEffect(() => {
    startTransition()
  }, [startTransition, location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollHandler />
      <Navbar
        session={session}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
        signInError={signInError}
        onDismissError={() => setSignInError(null)}
      />

      <main className="flex-1">
        <PageTransitionOverlay isTransitioning={isTransitioning} />
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/:semester" element={<SemesterPage />} />
            <Route
              path="/library/:semester/:moduleId"
              element={<ModulePage />}
            />
            <Route
              path="/contribute"
              element={
                <RequireAuth>
                  <ContributePage />
                </RequireAuth>
              }
            />
            <Route
              path="/my-submissions"
              element={
                <RequireAuth>
                  <MySubmissionsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/about"
              element={<AboutPage />}
            />
            <Route
              path="/admin/login"
              element={<AdminLoginPage />}
            />
            <Route
              path="/admin"
              element={
                <RequireAdminAuth>
                  <AdminPage />
                </RequireAdminAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
