import { useApiQuery } from '@/hooks/useCatalog'
import { fetchMySubmissions } from '@/api/submissions'
import { getMockSubmissions } from '@/data/mockData'
import type { Submission } from '@/types'

export function useMySubmissions(accessToken: string | undefined) {
  return useApiQuery<Submission[]>(
    'my-submissions',
    !!accessToken,
    () => fetchMySubmissions(accessToken!),
    () => getMockSubmissions(),
  )
}
