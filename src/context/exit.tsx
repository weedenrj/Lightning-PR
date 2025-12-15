import { createContext, useContext, type ReactNode } from "react"

type ExitFn = (code?: number) => void

type ExitContextValue = {
  exit: ExitFn
}

const ExitContext = createContext<ExitContextValue | null>(null)

type ExitProviderProps = {
  children: ReactNode
  onExit: ExitFn
}

export function ExitProvider({ children, onExit }: ExitProviderProps) {
  const value: ExitContextValue = {
    exit: onExit,
  }

  return <ExitContext.Provider value={value}>{children}</ExitContext.Provider>
}

export function useExit(): ExitFn {
  const value = useContext(ExitContext)
  if (!value) throw new Error("useExit must be used within an ExitProvider")
  return value.exit
}
