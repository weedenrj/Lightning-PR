import { useRef, useState } from "react"
import { TextAttributes } from "@opentui/core"
import type { TextareaRenderable } from "@opentui/core"
import { useTheme, getBranchColor } from "../context/theme"
import { StreamlinedLayout, type Breadcrumb } from "./StreamlinedLayout"
import { useKeyboard } from "@opentui/react"
import type { Template } from "../lib/templates"
import { getErrorContent, type ErrorReason } from "../lib/errors"

export type ScreenStatus =
  | { type: "error"; reason: ErrorReason; compareUrl: string | null; onAction?: () => void }
  | { type: "selecting-branch" }
  | { type: "selecting-template" }
  | { type: "editing" }
  | { type: "creating" }
  | { type: "success"; url: string }
  | { type: "failed"; error: string; compareUrl: string | null }

interface UnifiedScreenProps {
  status: ScreenStatus
  currentBranch: string | null
  branches: string[]
  templates: Template[]
  selectedBranch: string | null
  selectedTemplate: Template | null
  editorContent: string
  onBranchSelect: (branch: string) => void
  onBranchDeselect: () => void
  onTemplateSelect: (template: Template) => void
  onTemplateDeselect: () => void
  onEditorChange: (content: string) => void
  onSave: (content: string) => void
  onCancel: () => void
}

export function UnifiedScreen({
  status,
  currentBranch,
  branches,
  templates,
  selectedBranch,
  selectedTemplate,
  editorContent,
  onBranchSelect,
  onBranchDeselect,
  onTemplateSelect,
  onTemplateDeselect,
  onEditorChange,
  onSave,
  onCancel,
}: UnifiedScreenProps) {
  const { theme } = useTheme()
  const textareaRef = useRef<TextareaRenderable>(null)
  const [focusedBranchIndex, setFocusedBranchIndex] = useState(0)
  const [focusedTemplateIndex, setFocusedTemplateIndex] = useState(0)

  useKeyboard((key) => {
    if (key.name === "escape") {
      onCancel()
      return
    }

    if (status.type === "success" || status.type === "failed") {
      if (key.name === "return") {
        onCancel()
      }
      return
    }

    if (status.type === "error") {
      const content = getErrorContent(status.reason)

      if (content.hasAction && status.onAction) {
        if (key.name === "y" || key.name === "return") {
          status.onAction()
          return
        }
        if (key.name === "n") {
          onCancel()
        }
      }

      return
    }

    if (status.type === "creating") {
      return
    }

    if (status.type === "editing") {
      if ((key.ctrl && key.name === "s") || (key.meta && key.name === "s")) {
        const content = textareaRef.current?.plainText ?? editorContent
        onSave(content)
        return
      }
      if ((key.ctrl && key.name === "b") || (key.meta && key.name === "b")) {
        onTemplateDeselect()
        return
      }
    }

    if ((key.ctrl && key.name === "s") || (key.meta && key.name === "s")) {
      return
    }

    if (status.type === "selecting-template") {
      if (key.name === "left") {
        onBranchDeselect()
        return
      }
      if (templates.length === 0) return

      if (key.name === "up" || (key.ctrl && key.name === "p")) {
        setFocusedTemplateIndex((prev) => (prev > 0 ? prev - 1 : templates.length - 1))
        return
      }
      if (key.name === "down" || (key.ctrl && key.name === "n")) {
        setFocusedTemplateIndex((prev) => (prev < templates.length - 1 ? prev + 1 : 0))
        return
      }
      if (key.name === "right" || key.name === "return") {
        onTemplateSelect(templates[focusedTemplateIndex]!)
        return
      }
    }

    if (status.type === "selecting-branch") {
      if (branches.length === 0) return

      if (key.name === "up" || (key.ctrl && key.name === "p")) {
        setFocusedBranchIndex((prev) => (prev > 0 ? prev - 1 : branches.length - 1))
        return
      }
      if (key.name === "down" || (key.ctrl && key.name === "n")) {
        setFocusedBranchIndex((prev) => (prev < branches.length - 1 ? prev + 1 : 0))
        return
      }
      if (key.name === "right" || key.name === "return") {
        onBranchSelect(branches[focusedBranchIndex]!)
        setFocusedTemplateIndex(0)
        return
      }
    }
  })

  const errorContent = status.type === "error" ? getErrorContent(status.reason) : null

  const hints =
    status.type === "editing"
      ? [
        { key: "⌘S", label: "save & create" },
        { key: "⌘B", label: "back" },
        { key: "⌃K", label: "delete line" },
        { key: "⇧↑↓ + DEL", label: "select lines and delete" },
        { key: "esc", label: "quit" },
      ]
      : status.type === "selecting-template"
        ? [
          { key: "↑↓", label: "navigate" },
          { key: "←→", label: "navigate" },
          { key: "esc", label: "quit" },
        ]
        : status.type === "selecting-branch"
          ? [
            { key: "↑↓", label: "navigate" },
            { key: "→", label: "navigate" },
            { key: "esc", label: "quit" },
          ]
          : status.type === "error" && errorContent?.hasAction && status.onAction
            ? [
              { key: "y", label: errorContent.actionLabel || "yes" },
              { key: "n", label: "no" },
              { key: "esc", label: "quit" },
            ]
            : status.type === "success"
              ? [{ key: "enter", label: "exit" }]
              : status.type === "failed"
                ? [{ key: "esc", label: "quit" }]
                : status.type === "creating"
                  ? []
                  : [{ key: "esc", label: "quit" }]

  const buildBreadcrumbs = (): Breadcrumb[] => {
    const crumbs: Breadcrumb[] = []

    if (status.type === "error") {
      crumbs.push({ label: "Error", fg: theme.error })
      return crumbs
    }

    if (status.type === "success") {
      crumbs.push({ label: "✓ Created", fg: theme.success, attributes: TextAttributes.BOLD })
      return crumbs
    }

    if (status.type === "failed") {
      crumbs.push({ label: "✗ Failed", fg: theme.error })
      return crumbs
    }

    crumbs.push({
      label: currentBranch ?? "Branch",
      fg: currentBranch ? getBranchColor(theme, currentBranch) : theme.textMuted,
    })

    crumbs.push({
      label: selectedBranch ?? "Target",
      fg: selectedBranch ? getBranchColor(theme, selectedBranch) : theme.textMuted,
    })

    crumbs.push({
      label: selectedTemplate?.name ?? "Template",
      fg: selectedTemplate ? theme.text : theme.textMuted,
    })

    if (status.type === "creating") {
      crumbs.push({ label: "Creating", fg: theme.info, attributes: TextAttributes.BOLD, showLoader: true })
    } else if (status.type === "editing") {
      crumbs.push({ label: "Editing", fg: theme.accent, attributes: TextAttributes.BOLD, showLoader: true })
    } else if (status.type === "selecting-template") {
      crumbs.push({ label: "Selecting", fg: theme.textMuted })
    } else if (status.type === "selecting-branch") {
      crumbs.push({ label: "Selecting", fg: theme.textMuted })
    }

    return crumbs
  }

  const renderContent = () => {
    if (status.type === "error") {
      const content = errorContent ?? getErrorContent(status.reason)

      return (
        <box flexDirection="column" flexGrow={1} gap={1}>
          <box flexDirection="row" gap={1}>
            <text fg={theme.error}>✗</text>
            <text attributes={TextAttributes.BOLD} fg={theme.error}>
              {content.title}
            </text>
          </box>
          <text fg={theme.text}>{content.message}</text>
          {status.compareUrl && (
            <box paddingTop={1}>
              <text fg={theme.accent}>{status.compareUrl}</text>
            </box>
          )}
          {content.hasAction && status.onAction && (
            <box paddingTop={1}>
              <text fg={theme.textMuted}>Press y to {content.actionLabel}</text>
            </box>
          )}
        </box>
      )
    }

    if (status.type === "creating") {
      return (
        <box flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1}>
          <text fg={theme.textMuted}>Creating your pull request...</text>
        </box>
      )
    }

    if (status.type === "success") {
      const hyperlink = `\x1b]8;;${status.url}\x07${status.url}\x1b]8;;\x07`
      return (
        <box flexDirection="column" flexGrow={1} gap={2}>
          <box flexDirection="column" gap={1}>
            <box flexDirection="row" gap={1}>
              <text fg={theme.success} attributes={TextAttributes.BOLD}>✓</text>
              <text fg={theme.success} attributes={TextAttributes.BOLD}>Pull request created</text>
            </box>
            <box paddingLeft={2}>
              <text fg={theme.accent}>{hyperlink}</text>
            </box>
          </box>
          <box paddingLeft={2}>
            <text fg={theme.textMuted}>⌘+click to open in browser</text>
          </box>
        </box>
      )
    }

    if (status.type === "failed") {
      return (
        <box flexDirection="column" flexGrow={1} gap={2}>
          <box flexDirection="column" gap={1}>
            <box flexDirection="row" gap={1}>
              <text fg={theme.error} attributes={TextAttributes.BOLD}>✗</text>
              <text fg={theme.error} attributes={TextAttributes.BOLD}>Failed to create pull request</text>
            </box>
            <box paddingLeft={2}>
              <text fg={theme.text}>{status.error}</text>
            </box>
          </box>
        </box>
      )
    }

    if (status.type === "selecting-branch") {
      return (
        <box flexDirection="column" flexGrow={1} gap={1}>
          <text fg={theme.textMuted}>Select target branch</text>
          {branches.length === 0 ? (
            <text fg={theme.textMuted}>No branches available</text>
          ) : (
            <scrollbox flexGrow={1}>
              <box flexDirection="column">
                {branches.map((branch, index) => (
                  <box key={branch} flexDirection="row">
                    <text
                      fg={
                        index === focusedBranchIndex
                          ? theme.accent
                          : getBranchColor(theme, branch)
                      }
                      attributes={index === focusedBranchIndex ? TextAttributes.BOLD : undefined}
                    >
                      {index === focusedBranchIndex ? "▶ " : "  "}
                      {branch}
                    </text>
                  </box>
                ))}
              </box>
            </scrollbox>
          )}
        </box>
      )
    }

    if (status.type === "selecting-template") {
      return (
        <box flexDirection="column" flexGrow={1} gap={1}>
          <text fg={theme.textMuted}>Select template</text>
          {templates.length === 0 ? (
            <text fg={theme.textMuted}>No templates available</text>
          ) : (
            <scrollbox flexGrow={1}>
              <box flexDirection="column">
                {templates.map((template, index) => (
                  <box key={template.path} flexDirection="column">
                    <text
                      fg={index === focusedTemplateIndex ? theme.accent : theme.text}
                      attributes={index === focusedTemplateIndex ? TextAttributes.BOLD : undefined}
                    >
                      {index === focusedTemplateIndex ? "▶ " : "  "}
                      {template.name}
                    </text>
                    <text fg={theme.textMuted}>
                      {"    "}{template.path}
                    </text>
                  </box>
                ))}
              </box>
            </scrollbox>
          )}
        </box>
      )
    }

    return (
      <box flexDirection="column" flexGrow={1}>
        <box borderStyle="single" borderColor={theme.border} flexGrow={1} padding={1}>
          <textarea
            key={selectedTemplate?.path}
            ref={textareaRef}
            initialValue={editorContent}
            focused
            flexGrow={1}
            onContentChange={() => {
              const content = textareaRef.current?.plainText ?? ""
              onEditorChange(content)
            }}
          />
        </box>
      </box>
    )
  }

  return (
    <StreamlinedLayout
      breadcrumbs={buildBreadcrumbs()}
      hints={hints}
    >
      {renderContent()}
    </StreamlinedLayout>
  )
}
