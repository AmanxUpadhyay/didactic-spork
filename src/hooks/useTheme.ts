import { useState, useEffect, useCallback } from 'react'

export const THEMES = [
  'strawberry-milk',
  'strawberry-milk-dark',
  'matcha-latte',
  'matcha-latte-dark',
  'honey-biscuit',
  'honey-biscuit-dark',
] as const

export type Theme = (typeof THEMES)[number]

const STORAGE_KEY = 'jugalbandi-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'strawberry-milk'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && THEMES.includes(stored as Theme)) return stored as Theme
  return 'strawberry-milk'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const isDark = theme.endsWith('-dark')

  return { theme, setTheme, isDark, themes: THEMES }
}
