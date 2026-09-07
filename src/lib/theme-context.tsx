'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type AppTheme = 'sandstone' | 'dark'

interface ThemeContextType {
  theme: AppTheme
  isSandstone: boolean
  toggleTheme: () => void
  setTheme: (theme: AppTheme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'sandstone',
  isSandstone: true,
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('sandstone')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('climbinghub_theme') as AppTheme | null
      if (saved === 'dark' || saved === 'sandstone') {
        setThemeState(saved)
      }
    } catch {
      // ignore localStorage errors in private mode
    }
  }, [])

  const setTheme = (t: AppTheme) => {
    setThemeState(t)
    try {
      localStorage.setItem('climbinghub_theme', t)
    } catch {
      // ignore
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'sandstone' ? 'dark' : 'sandstone')
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isSandstone: theme === 'sandstone',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
