import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"

interface HeaderProps {
  currentBranch: string | null
  targetBranch: string | null
}

export function Header({ currentBranch, targetBranch }: HeaderProps) {
  const { theme } = useTheme()

  return (
    <box
      padding={1}
      borderStyle="single"
      borderColor={theme.borderActive}
      backgroundColor={theme.backgroundPanel}
    >
      <box flexDirection="column" gap={1}>
        <box flexDirection="row" alignItems="center" gap={1}>
          <text fg={theme.accent}>❯</text>
          <text attributes={TextAttributes.BOLD} fg={theme.text}>
            Create Pull Request
          </text>
        </box>
        {currentBranch && (
          <box flexDirection="row" alignItems="center" gap={1}>
            <text fg={theme.textMuted}>Merging</text>
            <box
              style={{
                backgroundColor: theme.backgroundElement,
                paddingLeft: 1,
                paddingRight: 1,
              }}
            >
              <text fg={theme.info}>{currentBranch}</text>
            </box>
            <text fg={theme.textMuted}>→</text>
            {targetBranch ? (
              <box
                style={{
                  backgroundColor: theme.accent,
                  paddingLeft: 1,
                  paddingRight: 1,
                }}
              >
                <text attributes={TextAttributes.BOLD} fg={theme.background}>
                  {targetBranch}
                </text>
              </box>
            ) : (
              <text attributes={TextAttributes.DIM} fg={theme.textMuted}>
                [select target]
              </text>
            )}
          </box>
        )}
      </box>
    </box>
  )
}
