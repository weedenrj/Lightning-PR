import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"

export function Logo() {
  const { theme } = useTheme()

  return (
    <box flexDirection="row" padding={1} flexShrink={0} alignItems="center">
      <text
        fg="#FFD700"
        attributes={TextAttributes.BOLD}
        selectable={false}
        wrapMode="none"
      >
        ⚡
      </text>
      <text
        fg={theme.accent}
        attributes={TextAttributes.BOLD}
        selectable={false}
        wrapMode="none"
      >
        PR
      </text>
    </box>
  )
}