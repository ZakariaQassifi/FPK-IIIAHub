import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { usePageTransition as usePageTransitionCtx } from '@/components/layout/PageTransition'

export function useRouterTransition() {
  const { startTransition, completeTransition } = usePageTransitionCtx()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    startTransition()
    return () => {
      completeTransition()
    }
  }, [location.pathname, startTransition, completeTransition])

  const transitionTo = useCallback(
    (to: string) => {
      startTransition().then(() => {
        navigate(to)
      })
    },
    [navigate, startTransition],
  )

  return { transitionTo }
}
