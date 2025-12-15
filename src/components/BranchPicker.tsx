import type { SelectOption } from "@opentui/core"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"
import { useKeyboard } from "@opentui/react"
import { KeyHints } from "./KeyHints"

interface BranchPickerProps {
  branches: string[]
  currentBranch: string | null
  onSelect: (branch: string) => void
  onCancel: () => void
}

export function BranchPicker({
  branches,
  onSelect,
  onCancel,
}: BranchPickerProps) {
  const { theme } = useTheme()

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape" || (key.ctrl && key.name === "c")) {
      onCancel()
    }
  })

  const options: SelectOption[] = branches.map((branch) => ({
    name: branch,
    value: branch,
    description: "",
  }))

  const hints = [
    { key: "↑↓", label: "navigate" },
    { key: "enter", label: "select" },
    { key: "q", label: "quit" },
  ]

  return (
    <box flexDirection="column" gap={1} flexGrow={1}>
      <text attributes={TextAttributes.BOLD} fg={theme.text}>
        Select target branch:
      </text>
      <box
        flexGrow={1}
        borderStyle="single"
        borderColor={theme.border}
        backgroundColor={theme.backgroundPanel}
        padding={1}
      >
        <select
          focused
          options={options}
          wrapSelection
          showDescription={false}
          backgroundColor={theme.backgroundPanel}
          textColor={theme.text}
          focusedBackgroundColor={theme.accent}
          focusedTextColor={theme.background}
          showScrollIndicator
          onSelect={(_, option) => {
            if (option) {
              onSelect(option.value as string)
            }
          }}
        />
      </box>
      <KeyHints hints={hints} />
    </box>
  )
}
