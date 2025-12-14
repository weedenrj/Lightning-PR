import { TextAttributes } from "@opentui/core"

interface KeyHint {
  key: string
  label: string
}

interface KeyHintsProps {
  hints: KeyHint[]
}

export function KeyHints({ hints }: KeyHintsProps) {
  if (hints.length === 0) return null

  return (
    <box
      flexDirection="row"
      gap={2}
      padding={1}
      borderStyle="single"
    >
      {hints.map((hint, index) => (
        <box key={hint.key} flexDirection="row" gap={1} alignItems="center">
          <box
            style={{
              backgroundColor: "gray",
              paddingLeft: 1,
              paddingRight: 1,
            }}
          >
            <text attributes={TextAttributes.BOLD}>{hint.key}</text>
          </box>
          <text attributes={TextAttributes.DIM}>{hint.label}</text>
          {index < hints.length - 1 && (
            <text attributes={TextAttributes.DIM}>•</text>
          )}
        </box>
      ))}
    </box>
  )
}