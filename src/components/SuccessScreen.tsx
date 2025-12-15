import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"
import { KeyHints } from "./KeyHints"
import { useTheme } from "../context/theme"

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

  const hints = [
    { key: "enter", label: "exit" },
    { key: "q", label: "quit" },
  ]

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      gap={1}
      padding={2}
      borderStyle="single"
      borderColor={theme.success}
      backgroundColor={theme.backgroundPanel}
    >
      <box flexDirection="column" gap={1}>
        <box flexDirection="row" gap={1} alignItems="center">
          <text fg={theme.success}>✓</text>
          <text attributes={TextAttributes.BOLD} fg={theme.success}>
            Pull Request Created
          </text>
        </box>
        <text fg={theme.text}>
          Your pull request has been created successfully.
        </text>
        <box
          backgroundColor={theme.backgroundElement}
          padding={1}
          borderStyle="single"
          borderColor={theme.borderActive}
        >
          <text fg={theme.accent}>{url}</text>
        </box>
        <text attributes={TextAttributes.DIM} fg={theme.textMuted}>
          Auto-exiting in a few seconds...
        </text>
      </box>
      <KeyHints hints={hints} />
    </box>
  )
}
