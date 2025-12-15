import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"

interface WelcomeScreenProps {
  onQuit: () => void
}

export function WelcomeScreen({ onQuit }: WelcomeScreenProps) {
  const { theme } = useTheme()

  useKeyboard((key) => {
    if (
      key.name === "q" ||
      key.name === "escape" ||
      (key.ctrl && key.name === "c")
    ) {
      onQuit()
    }
  })

  return (
    <box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      gap={1}
    >
      <box flexDirection="row" gap={1} alignItems="center">
        <text fg={theme.accent}>❯</text>
        <text attributes={TextAttributes.BOLD} fg={theme.accent}>
          templatr
        </text>
      </box>
      <box flexDirection="row" gap={1} alignItems="center">
        <text fg={theme.info}>◐</text>
        <text attributes={TextAttributes.DIM} fg={theme.textMuted}>
          Initializing...
        </text>
      </box>
    </box>
  )
}