import { useEffect, useState } from 'react'

const STORAGE_KEY = 'fpk-library-version'
const EVENT_NAME = 'fpk-library-changed'

/**
 * Publish a library data change.
 *
 * Admin mutations (module create/rename/delete, resource publish/delete)
 * call this so every open view of the public library refetches immediately,
 * including views in another browser tab.
 */
export function invalidateLibrary(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    /* storage unavailable (private mode) - the in-tab event still fires */
  }
  window.dispatchEvent(new Event(EVENT_NAME))
}

/**
 * A counter that increments whenever the library data changes.
 *
 * Feed it into the `version` argument of the library queries so they
 * refetch as soon as an admin publishes or removes content.
 */
export function useLibraryVersion(): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const bump = () => setVersion((current) => current + 1)

    // Same tab
    window.addEventListener(EVENT_NAME, bump)
    // Other tabs
    window.addEventListener('storage', bump)

    return () => {
      window.removeEventListener(EVENT_NAME, bump)
      window.removeEventListener('storage', bump)
    }
  }, [])

  return version
}
