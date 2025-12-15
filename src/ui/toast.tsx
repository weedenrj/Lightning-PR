import { createContext, useContext, useState, type ReactNode } from "react"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"

type ToastVariant = "success" | "error" | "warning" | "info"

type ToastOptions = {
  variant: ToastVariant
  message: string
  title?: string
  duration?: number
}

type ToastState = {
  variant: ToastVariant
  message: string
  title?: string
} | null

type ToastContextValue = {
  show: (options: ToastOptions) => void
  error: (err: Error | string) => void
  currentToast: ToastState
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastState>(null)

  const show = (options: ToastOptions) => {
    const { duration = 3000, ...toastState } = options
    setCurrentToast(toastState)
    setTimeout(() => {
      setCurrentToast(null)
    }, duration)
  }

  const error = (err: Error | string) => {
    const message = err instanceof Error ? err.message : err
    show({
      variant: "error",
      message,
    })
  }

  const value: ToastContextValue = {
    show,
    error,
    currentToast,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error("useToast must be used within a ToastProvider")
  return value
}

function Toast() {
  const { currentToast } = useToast()
  const { theme } = useTheme()

  if (!currentToast) return null

  const variantColors: Record<ToastVariant, string> = {
    success: theme.success,
    error: theme.error,
    warning: theme.warning,
    info: theme.info,
  }

  const borderColor = variantColors[currentToast.variant]

  return (
    <box
      position="absolute"
      top={2}
      right={2}
      maxWidth={60}
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor={theme.backgroundPanel}
      borderStyle="single"
      borderColor={borderColor}
    >
      <box flexDirection="column" gap={1}>
        {currentToast.title && (
          <text attributes={TextAttributes.BOLD} fg={theme.text}>
            {currentToast.title}
          </text>
        )}
        <text fg={theme.text}>{currentToast.message}</text>
      </box>
    </box>
  )
}
