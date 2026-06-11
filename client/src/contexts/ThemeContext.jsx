import { createContext, useContext } from 'react'
import { THEMES, THEME_CATEGORIES, applyTheme } from '../utils/themes'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  function setTheme(name) {
    applyTheme(name)
  }

  return (
    <ThemeContext.Provider value={{ themes: THEMES, categories: THEME_CATEGORIES, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
