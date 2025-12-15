import { createContext, useContext, type ReactNode } from "react"

type ThemeColors = {
  primary: string
  secondary: string
  accent: string
  error: string
  warning: string
  success: string
  info: string
  text: string
  textMuted: string
  background: string
  backgroundPanel: string
  backgroundElement: string
  border: string
  borderActive: string
  borderSubtle: string
}

type Theme = ThemeColors

const darkTheme: Theme = {
  primary: "#0070F3",
  secondary: "#7928CA",
  accent: "#50E3C2",
  error: "#E5484D",
  warning: "#FFB224",
  success: "#46A758",
  info: "#0099FF",
  text: "#EDEDED",
  textMuted: "#878787",
  background: "#0A0A0A",
  backgroundPanel: "#1A1A1A",
  backgroundElement: "#292929",
  border: "#1F1F1F",
  borderActive: "#454545",
  borderSubtle: "#1A1A1A",
}

type ThemeContextValue = {
  theme: Theme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value: ThemeContextValue = {
    theme: darkTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error("useTheme must be used within a ThemeProvider")
  return value
}
