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
    <box flexDirection="row" gap={2} flexShrink={0}>
      {hints.map((hint) => (
        <box key={hint.key} flexDirection="row" gap={1}>
          <text fg={theme.accent}>{hint.key}</text>
          <text fg={theme.textMuted}>{hint.label}</text>
        </box>
      ))}
    </box>
  )
}
