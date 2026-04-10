import { afterEach, describe, expect, it } from 'vitest'
import { getThemeStorageKey, getStoredTheme, setStoredTheme, clearStoredTheme } from './themeStorage'

describe('themeStorage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  describe('getThemeStorageKey', () => {
    it('returns default key when no userId', () => {
      expect(getThemeStorageKey()).toBe('theme-default')
    })

    it('returns user-specific key', () => {
      expect(getThemeStorageKey('user-123')).toBe('theme-user-123')
    })
  })

  describe('getStoredTheme', () => {
    it('returns default theme when nothing stored', () => {
      expect(getStoredTheme()).toBe('ocean-blue')
    })

    it('returns stored valid theme', () => {
      localStorage.setItem('theme-default', 'forest-green')
      expect(getStoredTheme()).toBe('forest-green')
    })

    it('returns default theme for invalid stored value', () => {
      localStorage.setItem('theme-default', 'invalid-theme')
      expect(getStoredTheme()).toBe('ocean-blue')
    })

    it('returns stored theme for specific user', () => {
      localStorage.setItem('theme-user-1', 'royal-purple')
      expect(getStoredTheme('user-1')).toBe('royal-purple')
    })
  })

  describe('setStoredTheme', () => {
    it('stores theme in localStorage', () => {
      setStoredTheme('forest-green')
      expect(localStorage.getItem('theme-default')).toBe('forest-green')
    })

    it('stores theme for specific user', () => {
      setStoredTheme('slate-blue', 'user-1')
      expect(localStorage.getItem('theme-user-1')).toBe('slate-blue')
    })
  })

  describe('clearStoredTheme', () => {
    it('removes theme from localStorage', () => {
      localStorage.setItem('theme-default', 'forest-green')
      clearStoredTheme()
      expect(localStorage.getItem('theme-default')).toBeNull()
    })

    it('removes theme for specific user', () => {
      localStorage.setItem('theme-user-1', 'slate-blue')
      clearStoredTheme('user-1')
      expect(localStorage.getItem('theme-user-1')).toBeNull()
    })
  })
})
