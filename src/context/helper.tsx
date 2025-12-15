import { createContext, useContext, type ReactNode } from "react"

export function createSimpleContext<T>(name: string, init: () => T) {
  const ctx = createContext<T | null>(null)

  function Provider({ children }: { children: ReactNode }) {
    const value = init()
    return <ctx.Provider value={value}>{children}</ctx.Provider>
  }

  function use(): T {
    const value = useContext(ctx)
    if (!value) throw new Error(`${name} context must be used within a provider`)
    return value
  }

  return { Provider, use }
}

export function createSimpleContextWithProps<T, P extends Record<string, unknown>>(
  name: string,
  init: (props: P) => T
) {
  const ctx = createContext<T | null>(null)

  function Provider({ children, ...props }: { children: ReactNode } & P) {
    const value = init(props as unknown as P)
    return <ctx.Provider value={value}>{children}</ctx.Provider>
  }

  function use(): T {
    const value = useContext(ctx)
    if (!value) throw new Error(`${name} context must be used within a provider`)
    return value
  }

  return { Provider, use }
}
