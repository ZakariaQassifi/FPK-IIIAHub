import { useApiQuery } from '@/hooks/useCatalog'
import {
  fetchIiiaModules,
  fetchIiiaSemesters,
  fetchModuleResources,
} from '@/api/iiia'
import {
  getMockModules,
  getMockModuleResources,
  getMockSemesters,
} from '@/data/iiia'
import { useLibraryVersion } from '@/lib/librarySignal'

export function useIiiaSemesters(version = 0) {
  const signal = useLibraryVersion()
  return useApiQuery(
    'iiia-semesters',
    true,
    fetchIiiaSemesters,
    getMockSemesters,
    version + signal,
  )
}

export function useIiiaModules(semesterSlug: string | undefined, version = 0) {
  const signal = useLibraryVersion()
  return useApiQuery(
    `iiia-modules:${semesterSlug ?? ''}`,
    !!semesterSlug,
    () => fetchIiiaModules(semesterSlug!),
    () => getMockModules(semesterSlug ?? ''),
    version + signal,
  )
}

export function useModuleResources(moduleId: string | undefined, version = 0) {
  const signal = useLibraryVersion()
  return useApiQuery(
    `module-resources:${moduleId ?? ''}`,
    !!moduleId,
    () => fetchModuleResources(moduleId!),
    () => getMockModuleResources(moduleId ?? ''),
    version + signal,
  )
}
