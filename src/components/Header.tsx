import { TextAttributes } from "@opentui/core"

interface HeaderProps {
  currentBranch: string | null
  targetBranch: string | null
}

export function Header({ currentBranch, targetBranch }: HeaderProps) {
  return (
    <box padding={1} borderStyle="single">
      <box flexDirection="column" gap={1}>
        <text attributes={TextAttributes.BOLD}>Create Pull Request</text>
        {currentBranch && (
          <box flexDirection="row" alignItems="center" gap={1}>
            <text>Merging into</text>
            {targetBranch ? (
              <>
                <box
                  style={{
                    backgroundColor: "cyan",
                    paddingLeft: 1,
                    paddingRight: 1,
                  }}
                >
                  <text attributes={TextAttributes.BOLD}>{targetBranch}</text>
                </box>
                <text>←</text>
                <text attributes={TextAttributes.DIM}>{currentBranch}</text>
              </>
            ) : (
              <>
                <text attributes={TextAttributes.DIM}>[selecting]</text>
                <text>←</text>
                <text attributes={TextAttributes.DIM}>{currentBranch}</text>
              </>
            )}
          </box>
        )}
      </box>
    </box>
  )
}
