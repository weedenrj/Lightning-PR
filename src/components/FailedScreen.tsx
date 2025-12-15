import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"
import { KeyHints } from "./KeyHints"

interface FailedScreenProps {
  error: string
  compareUrl: string | null
  onQuit: () => void
}

export function FailedScreen({ error, compareUrl, onQuit }: FailedScreenProps) {
  const { theme } = useTheme()

  useKeyboard((key) => {
    if (
      key.name === "q" ||
      key.name === "escape" ||
      (key.ctrl && key.name === "c") ||
      key.name === "return"
    ) {
      onQuit()
    }
  })

  const hints = [{ key: "q", label: "quit" }]

  return (
    <box flexDirection="column" flexGrow={1} gap={1} padding={2}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.error}>✗</text>
        <text attributes={TextAttributes.BOLD} fg={theme.error}>
          Failed to Create PR
        </text>
      </box>
      <text fg={theme.text}>{error}</text>
      {compareUrl && (
        <box flexDirection="column" gap={1} paddingTop={1}>
          <text fg={theme.textMuted}>Create manually:</text>
          <text fg={theme.accent}>{compareUrl}</text>
        </box>
      )}
      <KeyHints hints={hints} />
    </box>
  )
}
