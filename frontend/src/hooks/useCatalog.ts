import { useEffect, useRef, useState } from 'react'
import { ApiError, ApiNotConfiguredError } from '@/api/client'
import {
  fetchFields,
  fetchModule,
  fetchModuleResources,
  fetchModules,
  fetchSemesters,
  fetchTimetable,
} from '@/api/catalog'
import {
  academicFields,
  getMockModule,
  getMockModules,
  getMockResources,
  getMockSemesters,
  getMockTimetable,
} from '@/data/mockData'
import type {
  AcademicField,
  AcademicModule,
  Resource,
  Semester,
  Timetable,
} from '@/types'

interface QueryState<T> {
  key: string
  data: T | null
  pending: boolean
  isMock: boolean
  notFound: boolean
  error: string | null
}

export function useApiQuery<T>(
  key: string,
  enabled: boolean,
  fetcher: () => Promise<T>,
  fallback: () => T | null,
  version = 0,
): {
  data: T | null
  loading: boolean
  isMock: boolean
  notFound: boolean
  error: string | null
} {
  const fetcherRef = useRef(fetcher)
  const fallbackRef = useRef(fallback)

  useEffect(() => {
    fetcherRef.current = fetcher
    fallbackRef.current = fallback
  })

  const [state, setState] = useState<QueryState<T>>({
    key: enabled ? key : '',
    data: null,
    pending: enabled,
    isMock: false,
    notFound: false,
    error: null,
  })

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) {
          setState({
            key: `${key}#${version}`,
            data,
            pending: false,
            isMock: false,
            notFound: false,
            error: null,
          })
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return

        if (
          err instanceof ApiError &&
          (err.status === 404 || err.status === 422)
        ) {
          setState({
            key: `${key}#${version}`,
            data: null,
            pending: false,
            isMock: false,
            notFound: true,
            error: err.message,
          })
          return
        }

        if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
          setState({
            key: `${key}#${version}`,
            data: null,
            pending: false,
            isMock: false,
            notFound: false,
            error: err.message,
          })
          return
        }

        if (
          !(err instanceof ApiNotConfiguredError) &&
          !(err instanceof ApiError) &&
          !(err instanceof TypeError)
        ) {
          setState({
            key: `${key}#${version}`,
            data: null,
            pending: false,
            isMock: false,
            notFound: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue',
          })
          return
        }

        if (err instanceof ApiError) {
          console.warn(
            `API error (${err.status}), using demo data:`,
            err.message,
          )
        } else {
          console.warn('API unavailable, using demo data:', err.message)
        }
        setState({
          key: `${key}#${version}`,
          data: fallbackRef.current(),
          pending: false,
          isMock: true,
          notFound: false,
          error: null,
        })
      })

    return () => {
      cancelled = true
    }
  }, [key, enabled, version])

  const stale = state.key !== (enabled ? `${key}#${version}` : '')

  return {
    data: stale ? null : state.data,
    loading: stale ? enabled : state.pending,
    isMock: stale ? false : state.isMock,
    notFound: stale ? false : state.notFound,
    error: stale ? null : state.error,
  }
}

export function useFields() {
  return useApiQuery<AcademicField[]>(
    'fields',
    true,
    () => fetchFields(),
    () => academicFields,
  )
}

export function useSemesters(fieldSlug: string | undefined) {
  return useApiQuery<Semester[]>(
    `semesters:${fieldSlug ?? ''}`,
    !!fieldSlug,
    () => fetchSemesters(fieldSlug!),
    () => getMockSemesters(fieldSlug!),
  )
}

export function useModules(semesterId: string | undefined) {
  return useApiQuery<AcademicModule[]>(
    `modules:${semesterId ?? ''}`,
    !!semesterId,
    () => fetchModules(semesterId!),
    () => getMockModules(semesterId!),
  )
}

export function useModule(moduleId: string | undefined) {
  return useApiQuery<AcademicModule | null>(
    `module:${moduleId ?? ''}`,
    !!moduleId,
    () => fetchModule(moduleId!),
    () => getMockModule(moduleId!),
  )
}

export function useModuleResources(moduleId: string | undefined) {
  return useApiQuery<Resource[]>(
    `resources:${moduleId ?? ''}`,
    !!moduleId,
    () => fetchModuleResources(moduleId!),
    () => getMockResources(moduleId!),
  )
}

export function useTimetable(semesterId: string | undefined) {
  return useApiQuery<Timetable | null>(
    `timetable:${semesterId ?? ''}`,
    !!semesterId,
    () => fetchTimetable(semesterId!),
    () => getMockTimetable(semesterId!),
  )
}
