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
  text: "#E6EDF3",
  textMuted: "#9AA4B2",
  background: "#0B0F14",
  border: "#253041",
  accent: "#60A5FA",
  branchFeature: "#34D399",
  branchStable: "#A78BFA",
  branchProduction: "#F59E0B",
  success: "#22C55E",
  error: "#EF4444",
  info: "#38BDF8",
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
