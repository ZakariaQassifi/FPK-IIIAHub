import type { ResourceCategory } from '@/types'

export interface CategoryBadge {
  label: string
  classes: string
  iconClasses: string
}

export const CATEGORY_BADGES: Record<ResourceCategory, CategoryBadge> = {
  COURS: {
    label: 'Cours',
    classes:
      'bg-accent-soft text-accent',
    iconClasses:
      'bg-accent/10 text-accent',
  },
  TD: {
    label: 'TD',
    classes:
      'bg-accent-soft text-accent',
    iconClasses:
      'bg-accent/10 text-accent',
  },
  TP: {
    label: 'TP',
    classes: 'bg-accent-soft text-accent',
    iconClasses:
      'bg-accent/10 text-accent',
  },
  SLIDES: {
    label: 'Slides',
    classes: 'bg-accent-soft text-accent',
    iconClasses:
      'bg-accent/10 text-accent',
  },
  EXAMS: {
    label: 'Examen',
    classes: 'bg-accent-soft text-apple-text-primary',
    iconClasses:
      'bg-accent/10 text-apple-text-primary',
  },
  CORRECTIONS: {
    label: 'Correction',
    classes:
      'bg-accent-soft text-accent',
    iconClasses:
      'bg-accent/10 text-accent',
  },
  RESUMES: {
    label: 'Résumé',
    classes:
      'bg-accent-soft text-apple-text-primary',
    iconClasses:
      'bg-accent/10 text-apple-text-primary',
  },
  OTHERS: {
    label: 'Autres',
    classes:
      'bg-accent-soft text-apple-text-primary',
    iconClasses:
      'bg-accent/10 text-apple-text-primary',
  },
}

export const CATEGORY_TAB_ORDER: ResourceCategory[] = [
  'COURS',
  'TD',
  'TP',
  'SLIDES',
  'EXAMS',
  'CORRECTIONS',
  'RESUMES',
  'OTHERS',
]
