import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"

interface WelcomeScreenProps {
  onQuit: () => void
}

export function WelcomeScreen({ onQuit }: WelcomeScreenProps) {
  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape" || (key.ctrl && key.name === "c")) {
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
      <text attributes={TextAttributes.BOLD}>templatr</text>
      <text attributes={TextAttributes.DIM}>Initializing...</text>
    </box>
  )
}