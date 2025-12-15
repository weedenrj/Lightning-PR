import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"
import { KeyHints } from "./KeyHints"

interface SuccessScreenProps {
  url: string
  onQuit: () => void
}

export function SuccessScreen({ url, onQuit }: SuccessScreenProps) {
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

  const hints = [{ key: "enter", label: "exit" }]

  return (
    <box flexDirection="column" flexGrow={1} gap={1} padding={2}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.success}>✓</text>
        <text attributes={TextAttributes.BOLD} fg={theme.success}>
          Pull Request Created
        </text>
      </box>
      <text fg={theme.text}>{url}</text>
      <text fg={theme.textMuted}>Exiting in a few seconds...</text>
      <KeyHints hints={hints} />
    </box>
  )
}
