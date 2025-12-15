import { useRef } from "react"
import { useKeyboard } from "@opentui/react"
import type { TextareaRenderable } from "@opentui/core"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"
import { KeyHints } from "./KeyHints"

interface EditorProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
}

export function Editor({ initialContent, onSave, onCancel }: EditorProps) {
  const { theme } = useTheme()
  const textareaRef = useRef<TextareaRenderable>(null)

  useKeyboard((key) => {
    if ((key.ctrl && key.name === "s") || (key.meta && key.name === "s")) {
      const content = textareaRef.current?.plainText ?? ""
      onSave(content)
      return
    }

    if (key.name === "escape") {
      onCancel()
      return
    }
  })

  const hints = [
    { key: "⌘S", label: "save & create PR" },
    { key: "esc", label: "cancel" },
  ]

  return (
    <box flexDirection="column" flexGrow={1} gap={1}>
      <text attributes={TextAttributes.BOLD} fg={theme.text}>
        Edit PR description:
      </text>
      <box
        borderStyle="single"
        borderColor={theme.borderActive}
        backgroundColor={theme.backgroundPanel}
        flexGrow={1}
        padding={1}
      >
        <textarea ref={textareaRef} initialValue={initialContent} focused />
      </box>
      <KeyHints hints={hints} />
    </box>
  )
}
