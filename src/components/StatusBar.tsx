import { useTheme } from "../context/theme"

export function StatusBar() {
  const { theme } = useTheme()

  return (
    <box flexDirection="row" gap={1} padding={1}>
      <text fg={theme.info}>◐</text>
      <text fg={theme.info}>Creating pull request...</text>
    </box>
  )
}
