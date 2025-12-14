import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"

interface BranchPickerProps {
  branches: string[]
  currentBranch: string | null
  onSelect: (branch: string) => void
}

export function BranchPicker({
  branches,
  onSelect,
}: BranchPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useKeyboard((key) => {
    if (key.name === "up" || key.name === "k") {
      setSelectedIndex((prev) => Math.max(0, prev - 1))
    } else if (key.name === "down" || key.name === "j") {
      setSelectedIndex((prev) => Math.min(branches.length - 1, prev + 1))
    } else if (key.name === "return" || key.name === "enter") {
      onSelect(branches[selectedIndex]!)
    }
  })

  return (
    <box flexDirection="column" gap={1}>
      <text attributes={TextAttributes.BOLD}>Select target branch:</text>
      <box flexDirection="column" gap={0}>
        {branches.map((branch, index) => (
          <box
            key={branch}
            style={{
              backgroundColor:
                index === selectedIndex ? "blue" : "transparent",
            }}
            paddingLeft={1}
            paddingRight={1}
          >
            <text
              attributes={
                index === selectedIndex
                  ? TextAttributes.BOLD | TextAttributes.INVERSE
                  : undefined
              }
            >
              {index === selectedIndex ? "→ " : "  "}
              {branch}
            </text>
          </box>
        ))}
      </box>
      <text attributes={TextAttributes.DIM}>
        Use ↑/↓ or j/k to navigate, Enter to select
      </text>
    </box>
  )
}
