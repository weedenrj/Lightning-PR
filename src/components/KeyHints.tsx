import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"

interface KeyHint {
  key: string
  label: string
}

interface KeyHintsProps {
  hints: KeyHint[]
}

export function KeyHints({ hints }: KeyHintsProps) {
  const { theme } = useTheme()

  if (hints.length === 0) return null

  return (
    <box
      flexDirection="row"
      gap={3}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      borderStyle="single"
      borderColor={theme.borderSubtle}
      backgroundColor={theme.backgroundPanel}
    >
      {hints.map((hint) => (
        <box key={hint.key} flexDirection="row" gap={1} alignItems="center">
          <box
            style={{
              backgroundColor: theme.backgroundElement,
              paddingLeft: 1,
              paddingRight: 1,
            }}
          >
            <text attributes={TextAttributes.BOLD} fg={theme.accent}>
              {hint.key}
            </text>
          </box>
          <text fg={theme.textMuted}>{hint.label}</text>
        </box>
      ))}
    </box>
  )
}