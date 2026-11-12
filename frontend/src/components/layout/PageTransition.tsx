import { useState, createContext, useContext, useCallback, type ReactNode } from 'react'

type TransitionDirection = 'forward' | 'backward'

interface PageTransitionContextValue {
  isTransitioning: boolean
  direction: TransitionDirection | null
  startTransition: () => Promise<void>
  completeTransition: () => void
}

const PageTransitionContext =
  createContext<PageTransitionContextValue | undefined>(undefined)

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext)
  if (!ctx) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider')
  }
  return ctx
}

interface PageTransitionProviderProps {
  children: ReactNode
  duration?: number
}

export function PageTransitionProvider({
  children,
  duration = 350,
}: PageTransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<TransitionDirection | null>(null)

  const startTransition = useCallback(async () => {
    setIsTransitioning(true)
    await new Promise((resolve) => setTimeout(resolve, duration))
    setIsTransitioning(false)
  }, [duration])

  const completeTransition = useCallback(() => {
    setIsTransitioning(false)
    setDirection(null)
  }, [])

  return (
    <PageTransitionContext.Provider
      value={{ isTransitioning, direction, startTransition, completeTransition }}
    >
      {children}
    </PageTransitionContext.Provider>
  )
}

interface PageTransitionOverlayProps {
  isTransitioning: boolean
}

export function PageTransitionOverlay({ isTransitioning }: PageTransitionOverlayProps) {
  return (
    <div
      className={`
        fixed inset-0 z-50 bg-apple-bg
        transition-opacity duration-300 ease-in-out
        ${isTransitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      aria-hidden="true"
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative">
          <svg
            className="h-12 w-12 animate-spin text-accent"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="mt-4 text-xs font-medium uppercase tracking-widest text-apple-text-secondary letter-spacing-widest">
            FPK IIIA
          </span>
        </div>
      </div>
    </div>
  )
}
