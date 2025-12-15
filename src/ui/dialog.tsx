import { createContext, useContext, useState, type ReactNode } from "react"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"

type DialogEntry = {
  element: ReactNode
  onClose?: () => void
}

type DialogContextValue = {
  clear: () => void
  replace: (element: ReactNode, onClose?: () => void) => void
  stack: DialogEntry[]
}

const DialogContext = createContext<DialogContextValue | null>(null)

export function DialogProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<DialogEntry[]>([])

  const clear = () => {
    stack.forEach((entry) => entry.onClose?.())
    setStack([])
  }

  const replace = (element: ReactNode, onClose?: () => void) => {
    stack.forEach((entry) => entry.onClose?.())
    setStack([{ element, onClose }])
  }

  const value: DialogContextValue = {
    clear,
    replace,
    stack,
  }

  return (
    <DialogContext.Provider value={value}>
      {children}
      {stack.length > 0 && (
        <DialogOverlay onClose={clear}>
          {stack[stack.length - 1]?.element}
        </DialogOverlay>
      )}
    </DialogContext.Provider>
  )
}

export function useDialog(): DialogContextValue {
  const value = useContext(DialogContext)
  if (!value) throw new Error("useDialog must be used within a DialogProvider")
  return value
}

type DialogOverlayProps = {
  children: ReactNode
  onClose: () => void
}

function DialogOverlay({ children, onClose }: DialogOverlayProps) {
  const { theme } = useTheme()

  return (
    <box
      position="absolute"
      left={0}
      top={0}
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      backgroundColor={theme.background}
      onMouseUp={onClose}
    >
      <box
        backgroundColor={theme.backgroundPanel}
        borderStyle="single"
        borderColor={theme.border}
        padding={2}
        minWidth={40}
        maxWidth={80}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {children}
      </box>
    </box>
  )
}

type DialogProps = {
  title: string
  children: ReactNode
  onClose?: () => void
}

export function Dialog({ title, children, onClose }: DialogProps) {
  const { theme } = useTheme()
  const dialog = useDialog()

  const handleClose = () => {
    onClose?.()
    dialog.clear()
  }

  return (
    <box flexDirection="column" gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text fg={theme.text} attributes={TextAttributes.BOLD}>
          {title}
        </text>
        <text fg={theme.textMuted} onMouseDown={handleClose}>
          esc
        </text>
      </box>
      {children}
    </box>
  )
}
