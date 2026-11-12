import { createContext } from 'react'
import type { Locale, TranslationKey, TranslationParams } from '@/i18n/translations'

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: TranslationKey, params?: TranslationParams) => string
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined)
