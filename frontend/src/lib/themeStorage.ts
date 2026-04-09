import { defaultTheme, isValidTheme, type ThemeName } from './themes'

const THEME_STORAGE_PREFIX = 'theme-'

export const getThemeStorageKey = (userId?: string): string => {
  if (!userId) {
    return 'theme-default'
  }

  return `${THEME_STORAGE_PREFIX}${userId}`
}

export const getStoredTheme = (userId?: string): ThemeName => {
  if (typeof window === 'undefined') {
    return defaultTheme
  }

  const storageKey = getThemeStorageKey(userId)
  const stored = localStorage.getItem(storageKey)

  if (!stored) {
    return defaultTheme
  }

  if (isValidTheme(stored)) {
    return stored
  }

  return defaultTheme
}

export const setStoredTheme = (theme: ThemeName, userId?: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = getThemeStorageKey(userId)
  localStorage.setItem(storageKey, theme)
}

export const clearStoredTheme = (userId?: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = getThemeStorageKey(userId)
  localStorage.removeItem(storageKey)
}
