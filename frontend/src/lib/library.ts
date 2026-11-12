import type { LibraryCategory, ResourceCategory } from '@/types/iiia'

export interface LibrarySection {
  key: LibraryCategory
  /** Database categories folded into this section. */
  categories: ResourceCategory[]
  labelKey:
    | 'category.COURS'
    | 'category.TD_TP'
    | 'category.EXAMS'
    | 'category.OTHERS'
}

/**
 * The four canonical library sections, always in the same order:
 * Cours, TD & TP, Examens, Others.
 */
export const LIBRARY_SECTIONS: LibrarySection[] = [
  { key: 'COURS', categories: ['COURS'], labelKey: 'category.COURS' },
  { key: 'TD_TP', categories: ['TD', 'TP'], labelKey: 'category.TD_TP' },
  {
    key: 'EXAMS',
    categories: ['EXAMS', 'CORRECTIONS'],
    labelKey: 'category.EXAMS',
  },
  {
    key: 'OTHERS',
    categories: ['OTHERS', 'RESUMES', 'SLIDES'],
    labelKey: 'category.OTHERS',
  },
]

export function sectionForCategory(
  category: ResourceCategory,
): LibrarySection | undefined {
  return LIBRARY_SECTIONS.find((section) =>
    section.categories.includes(category),
  )
}

/**
 * Group resources into the three library sections.
 *
 * Every section is returned, including empty ones, so a module that has no
 * material yet still shows the three clean sub-sections with an empty state.
 */
export function groupBySection<T extends { category: ResourceCategory }>(
  resources: T[],
): { section: LibrarySection; items: T[] }[] {
  return LIBRARY_SECTIONS.map((section) => ({
    section,
    items: resources.filter((resource) =>
      section.categories.includes(resource.category),
    ),
  }))
}
