import type { SelectOption } from "@opentui/core"
import { TextAttributes } from "@opentui/core"
import type { Template } from "../lib/templates"
import { useTheme } from "../context/theme"
import { useKeyboard } from "@opentui/react"
import { KeyHints } from "./KeyHints"

interface TemplatePickerProps {
  templates: Template[]
  onSelect: (template: Template) => void
  onCancel: () => void
}

export function TemplatePicker({
  templates,
  onSelect,
  onCancel,
}: TemplatePickerProps) {
  const { theme } = useTheme()

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape" || (key.ctrl && key.name === "c")) {
      onCancel()
    }
  })

  const options: SelectOption[] = templates.map((template) => ({
    name: template.name,
    value: template.path,
    description: template.path,
  }))

  const hints = [
    { key: "↑↓", label: "navigate" },
    { key: "enter", label: "select" },
    { key: "q", label: "quit" },
  ]

  return (
    <box flexDirection="column" gap={1} flexGrow={1}>
      <text attributes={TextAttributes.BOLD} fg={theme.text}>
        Select template:
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
          showDescription
          backgroundColor={theme.backgroundPanel}
          textColor={theme.text}
          descriptionColor={theme.textMuted}
          focusedBackgroundColor={theme.accent}
          focusedTextColor={theme.background}
          selectedDescriptionColor={theme.background}
          showScrollIndicator
          onSelect={(_, option) => {
            if (option) {
              const template = templates.find((t) => t.path === option.value)
              if (template) {
                onSelect(template)
              }
            }
          }}
        />
      </box>
      <KeyHints hints={hints} />
    </box>
  )
}
