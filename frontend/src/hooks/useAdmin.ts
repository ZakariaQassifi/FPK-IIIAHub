import { useEffect, useState } from 'react'
import {
  approveResource,
  createAnnouncement,
  deleteAnnouncement,
  fetchAdminAnnouncements,
  fetchAdminStats,
  fetchPendingResources,
  fetchResourceSignedUrl,
  rejectResource,
  updateAnnouncement,
  updateResourceMetadata,
  uploadTimetable,
} from '@/api/admin'
import {
  approvePendingSubmission,
  fetchPendingSubmissionSignedUrl,
  fetchPendingSubmissions,
  rejectPendingSubmission,
} from '@/api/admin'
import {
  createAdminModule,
  deleteAdminModule,
  deleteAdminResource,
  deleteAdminTimetable,
  fetchAdminModules,
  fetchAdminResources,
  fetchAdminTimetables,
  updateAdminModule,
  updateAdminResource,
  uploadAdminResource,
} from '@/api/iiia'
import {
  getMockAdminAnnouncements,
  getMockAdminStats,
  getMockPendingResources,
  getMockTimetable,
} from '@/data/mockData'
import {
  IIIA_ADMIN_MODULES,
  IIIA_ADMIN_RESOURCES,
  IIIA_ADMIN_TIMETABLES,
} from '@/data/iiia'
import { fetchTimetable } from '@/api/catalog'
import { invalidateLibrary } from '@/lib/librarySignal'
import { useApiQuery } from '@/hooks/useCatalog'
import { getSupabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAuth } from '@/hooks/useAuth'
import type { AdminStats, Announcement, PendingResource, Timetable } from '@/types'

export function useAdminStats(token: string | undefined, version = 0) {
  return useApiQuery<AdminStats>(
    'admin-stats',
    !!token,
    () => fetchAdminStats(token!),
    () => getMockAdminStats(),
    version,
  )
}

export function usePendingResources(token: string | undefined, version = 0) {
  return useApiQuery<PendingResource[]>(
    'admin-pending',
    !!token,
    () => fetchPendingResources(token!),
    () => getMockPendingResources(),
    version,
  )
}

export function useAdminAnnouncements(token: string | undefined, version = 0) {
  return useApiQuery<Announcement[]>(
    'admin-announcements',
    !!token,
    () => fetchAdminAnnouncements(token!),
    () => getMockAdminAnnouncements(),
    version,
  )
}

export function useTimetableAdmin(
  semesterId: string | undefined,
  version = 0,
) {
  return useApiQuery<Timetable | null>(
    `admin-timetable:${semesterId ?? ''}`,
    !!semesterId,
    () => fetchTimetable(semesterId!),
    () => getMockTimetable(semesterId!),
    version,
  )
}

export function useAdminModules(
  token: string | undefined,
  semesterId?: string,
  version = 0,
) {  return useApiQuery(
    `admin-modules:${semesterId ?? ''}`,
    !!token,
    () => fetchAdminModules(token!, semesterId),
    () =>
      IIIA_ADMIN_MODULES.filter(
        (module) => !semesterId || module.semesterId === semesterId,
      ),
    version,
  )
}

export function useAdminResources(token: string | undefined, version = 0) {
  return useApiQuery(
    'admin-resources',
    !!token,
    () => fetchAdminResources(token!),
    () => IIIA_ADMIN_RESOURCES,
    version,
  )
}

export function useAdminTimetables(token: string | undefined, version = 0) {
  return useApiQuery(
    'admin-timetables',
    !!token,
    () => fetchAdminTimetables(token!),
    () => IIIA_ADMIN_TIMETABLES,
    version,
  )
}

export function usePendingSubmissions(
  token: string | undefined,
  version = 0,
) {
  return useApiQuery(
    'admin-pending-submissions',
    !!token,
    () => fetchPendingSubmissions(token!),
    () => [],
    version,
  )
}

export function useAdminMutations(token: string | undefined) {
  /** Mutating the academic tree must instantly invalidate the public library. */
  const withLibraryInvalidation = async <T,>(
    action: () => Promise<T>,
  ): Promise<T> => {
    const result = await action()
    invalidateLibrary()
    return result
  }

  return {
    approve: (id: string) =>
      withLibraryInvalidation(() => approveResource(token!, id)),
    reject: (id: string) =>
      withLibraryInvalidation(() => rejectResource(token!, id)),
    updateMetadata: (id: string, patch: Parameters<typeof updateResourceMetadata>[2]) =>
      updateResourceMetadata(token!, id, patch),
    preview: (id: string) => fetchResourceSignedUrl(token!, id),
    uploadTimetableFile: (payload: {
      semesterId: string
      academicYear: string
      file: File
    }) => uploadTimetable(token!, payload),
    uploadResourceFile: (payload: Parameters<typeof uploadAdminResource>[1]) =>
      withLibraryInvalidation(() => uploadAdminResource(token!, payload)),
    createAnnouncementEntry: (payload: Parameters<typeof createAnnouncement>[1]) =>
      createAnnouncement(token!, payload),
    updateAnnouncementEntry: (
      id: string,
      payload: Parameters<typeof updateAnnouncement>[2],
    ) => updateAnnouncement(token!, id, payload),
    deleteAnnouncementEntry: (id: string) => deleteAnnouncement(token!, id),
    deleteResource: (id: string) =>
      withLibraryInvalidation(() => deleteAdminResource(token!, id)),
    createModule: (payload: Parameters<typeof createAdminModule>[1]) =>
      withLibraryInvalidation(() => createAdminModule(token!, payload)),
    editModule: (
      id: string,
      patch: Parameters<typeof updateAdminModule>[2],
    ) => withLibraryInvalidation(() => updateAdminModule(token!, id, patch)),
    deleteModule: (id: string) =>
      withLibraryInvalidation(() => deleteAdminModule(token!, id)),
    editResource: (
      id: string,
      patch: Parameters<typeof updateAdminResource>[2],
    ) => withLibraryInvalidation(() => updateAdminResource(token!, id, patch)),
    deleteTimetable: (id: string) => deleteAdminTimetable(token!, id),
    approveSubmission: (id: string) =>
      withLibraryInvalidation(() => approvePendingSubmission(token!, id)),
    rejectSubmission: (id: string) =>
      withLibraryInvalidation(() => rejectPendingSubmission(token!, id)),
    previewSubmission: (id: string) =>
      fetchPendingSubmissionSignedUrl(token!, id),
  }
}

export type AdminRoleStatus = 'loading' | 'admin' | 'user' | 'anon' | 'demo'

export function useAdminRole(): AdminRoleStatus {
  const { session } = useAuth()
  const { isAuthenticated: isAdminAuthenticated } =
    useAdminAuth()
  const supabaseConfigured = !!getSupabase()
  const [roleStatus, setRoleStatus] = useState<AdminRoleStatus>('loading')

  const status: AdminRoleStatus = !supabaseConfigured
    ? 'demo'
    : isAdminAuthenticated
      ? 'admin'
      : !session
        ? 'anon'
        : roleStatus

  useEffect(() => {
    if (!supabaseConfigured || !session || isAdminAuthenticated) return

    const userId = session!.user.id
    const supabase = getSupabase()
    if (!supabase) return
    let cancelled = false

    supabase
      .from('users')
      .select('id, roles!inner(name)')
      .eq('id', userId)
      .eq('roles.name', 'ADMIN')
      .then(({ data }) => {
        if (!cancelled) {
          setRoleStatus(data && data.length > 0 ? 'admin' : 'user')
        }
      })

    return () => {
      cancelled = true
    }
  }, [session, supabaseConfigured, isAdminAuthenticated])

  return status
}
