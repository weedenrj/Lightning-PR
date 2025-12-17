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
  text: "#E6F1FF",
  textMuted: "#8BA0B4",
  background: "#0B0F14",
  border: "#1E2A38",
  accent: "#22D3EE",
  branchFeature: "#4ADE80",
  branchStable: "#C084FC",
  branchProduction: "#F59E0B",
  success: "#4ADE80",
  error: "#FF5C57",
  info: "#22D3EE",
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
