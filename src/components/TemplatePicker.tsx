import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"
import type { Template } from "../lib/templates"

interface TemplatePickerProps {
  templates: Template[]
  onSelect: (template: Template) => void
}

export function TemplatePicker({
  templates,
  onSelect,
}: TemplatePickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useKeyboard((key) => {
    if (key.name === "up" || key.name === "k") {
      setSelectedIndex((prev) => Math.max(0, prev - 1))
    } else if (key.name === "down" || key.name === "j") {
      setSelectedIndex((prev) => Math.min(templates.length - 1, prev + 1))
    } else if (key.name === "return" || key.name === "enter") {
      onSelect(templates[selectedIndex]!)
    }
  })

  return (
    <box flexDirection="column" gap={1}>
      <text attributes={TextAttributes.BOLD}>Select template:</text>
      <box flexDirection="column" gap={0}>
        {templates.map((template, index) => (
          <box
            key={template.path}
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
              {template.name}
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
