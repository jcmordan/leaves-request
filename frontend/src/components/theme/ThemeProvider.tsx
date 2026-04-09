'use client'

import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { defaultTheme, isValidTheme, type ThemeName } from '@/lib/themes'
import { getStoredTheme, setStoredTheme } from '@/lib/themeStorage'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const useThemeContext = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }

  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = getStoredTheme(userId)
    setThemeState(storedTheme)

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', storedTheme)
    }
  }, [userId])

  const setTheme = (newTheme: ThemeName) => {
    if (!isValidTheme(newTheme)) {
      return
    }

    setThemeState(newTheme)
    setStoredTheme(newTheme, userId)

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
