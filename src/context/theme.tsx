import { createContext, useContext, type ReactNode } from "react"

type Theme = {
  text: string
  textMuted: string
  background: string
  border: string
  accent: string
  branchFeature: string
  branchStable: string
  branchProduction: string
  success: string
  error: string
  info: string
}

const darkTheme: Theme = {
  text: "#2A2F36",
  textMuted: "#6B7685",
  background: "#FCFCFC",
  border: "#CAD0D7",
  accent: "#3F72AF",
  branchFeature: "#6AA13E",
  branchStable: "#3F72AF",
  branchProduction: "#1A406C",
  success: "#16A34A",
  error: "#B91C1C",
  info: "#0E4876",
}

type ThemeContextValue = {
  theme: Theme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: darkTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error("useTheme must be used within a ThemeProvider")
  return value
}

export function getBranchColor(theme: Theme, branch: string): string {
  const lower = branch.toLowerCase()
  if (lower === "main" || lower === "master" || lower === "production") {
    return theme.branchProduction
  }
  if (lower === "develop" || lower === "dev" || lower === "staging") {
    return theme.branchStable
  }
  if (
    lower.startsWith("feature/") ||
    lower.startsWith("feat/") ||
    lower.startsWith("fix/") ||
    lower.startsWith("bugfix/") ||
    lower.startsWith("hotfix/")
  ) {
    return theme.branchFeature
  }
  return theme.accent
}
