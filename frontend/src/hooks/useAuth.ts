import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [initializing, setInitializing] = useState(() => !!getSupabase())
  const [signInError, setSignInError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setInitializing(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setInitializing(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    const supabase = getSupabase()
    setSignInError(null)

    if (!supabase) {
      setSignInError(
        "Connexion indisponible : Supabase n'est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env.",
      )
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

    if (error) {
      setSignInError(
        'Échec de la connexion Google. Vérifiez la configuration du fournisseur dans Supabase.',
      )
    }
  }

  async function signOut() {
    setSignInError(null)
    await getSupabase()?.auth.signOut()
  }

  return {
    session,
    initializing,
    signInError,
    setSignInError,
    signInWithGoogle,
    signOut,
  }
}
