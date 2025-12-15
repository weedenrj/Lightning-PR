import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"

const LOGO_LINES = [
  "▗▄▄▄▖▗▄▄▄▖▗▖  ▗▖▗▄▄▖ ▗▖    ▗▄▖▗▄▄▄▖▗▄▄▖ ",
  "  █  ▐▌   ▐▛▚▞▜▌▐▌ ▐▌▐▌   ▐▌ ▐▌ █  ▐▌ ▐▌",
  "  █  ▐▛▀▀▘▐▌  ▐▌▐▛▀▘ ▐▌   ▐▛▀▜▌ █  ▐▛▀▚▖",
  "  █  ▐▙▄▄▖▐▌  ▐▌▐▌   ▐▙▄▄▖▐▌ ▐▌ █  ▐▌ ▐▌",
]

export function Logo() {
  const { theme } = useTheme()

  return (
    <box flexDirection="column" padding={1} flexShrink={0}>
      {LOGO_LINES.map((line, i) => (
        <text
          key={i}
          fg={theme.accent}
          attributes={TextAttributes.BOLD}
          selectable={false}
          wrapMode="none"
        >
          {line}
        </text>
      ))}
    </box>
  )
}