import { useRef, useState } from "react"
import { TextAttributes } from "@opentui/core"
import type { TextareaRenderable } from "@opentui/core"
import { useTheme, getBranchColor } from "../context/theme"
import { Logo } from "./Logo"
import { KeyHints } from "./KeyHints"
import { useKeyboard } from "@opentui/react"
import type { PRInfo } from "../lib/github"
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
  username: string | null
  currentBranch: string | null
  recentPRs: PRInfo[]
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
  username,
  currentBranch,
  recentPRs,
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
    if (key.name === "q" || key.name === "escape" || (key.ctrl && key.name === "c")) {
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
      return
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
        { key: "q", label: "quit" },
      ]
      : status.type === "selecting-template"
        ? [
          { key: "↑↓", label: "navigate" },
          { key: "←→", label: "navigate" },
          { key: "q", label: "quit" },
        ]
        : status.type === "selecting-branch"
          ? [
            { key: "↑↓", label: "navigate" },
            { key: "→", label: "navigate" },
            { key: "q", label: "quit" },
          ]
          : status.type === "error" && errorContent?.hasAction && status.onAction
            ? [
              { key: "y", label: errorContent.actionLabel || "yes" },
              { key: "n", label: "no" },
              { key: "q", label: "quit" },
            ]
            : status.type === "success"
              ? [{ key: "enter", label: "exit" }]
              : status.type === "failed"
                ? [{ key: "q", label: "quit" }]
                : status.type === "creating"
                  ? [{ key: "q", label: "quit" }]
                  : [{ key: "q", label: "quit" }]

  const renderRightPane = () => {
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
        <box flexDirection="row" gap={1} padding={1}>
          <text fg={theme.info}>◐</text>
          <text fg={theme.info}>Lightning PR: creating pull request...</text>
        </box>
      )
    }

    if (status.type === "success") {
      return (
        <box flexDirection="column" flexGrow={1} gap={1}>
          <box flexDirection="row" gap={1}>
            <text fg={theme.success}>✓</text>
            <text attributes={TextAttributes.BOLD} fg={theme.success}>
              Pull Request Created
            </text>
          </box>
          <text fg={theme.text}>{status.url}</text>
          <text fg={theme.textMuted}>Exiting in a few seconds...</text>
        </box>
      )
    }

    if (status.type === "failed") {
      return (
        <box flexDirection="column" flexGrow={1} gap={1}>
          <box flexDirection="row" gap={1}>
            <text fg={theme.error}>✗</text>
            <text attributes={TextAttributes.BOLD} fg={theme.error}>
              Failed to Create PR
            </text>
          </box>
          <text fg={theme.text}>{status.error}</text>
          {status.compareUrl && (
            <box flexDirection="column" gap={1} paddingTop={1}>
              <text fg={theme.textMuted}>Create manually:</text>
              <text fg={theme.accent}>{status.compareUrl}</text>
            </box>
          )}
        </box>
      )
    }

    if (status.type === "selecting-branch") {
      return (
        <box flexDirection="column" gap={1} flexGrow={1}>
          <text attributes={TextAttributes.BOLD} fg={theme.text}>
            Select target branch:
          </text>
          <box borderStyle="single" borderColor={theme.border} flexGrow={1} padding={1}>
            {branches.length === 0 ? (
              <text fg={theme.textMuted}>No branches available</text>
            ) : (
              <scrollbox>
                <box flexDirection="column">
                  {branches.map((branch, index) => (
                    <box
                      key={branch}
                      flexDirection="row"
                      paddingLeft={1}
                      paddingRight={1}
                      paddingTop={0}
                      paddingBottom={0}
                    >
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
        </box>
      )
    }

    if (status.type === "selecting-template") {
      return (
        <box flexDirection="column" gap={1} flexGrow={1}>
          <text attributes={TextAttributes.BOLD} fg={theme.text}>
            Select template:
          </text>
          <box borderStyle="single" borderColor={theme.border} flexGrow={1} padding={1}>
            {templates.length === 0 ? (
              <text fg={theme.textMuted}>No templates available</text>
            ) : (
              <scrollbox>
                <box flexDirection="column">
                  {templates.map((template, index) => (
                    <box
                      key={template.path}
                      flexDirection="column"
                      paddingLeft={1}
                      paddingRight={1}
                      paddingTop={0}
                      paddingBottom={0}
                    >
                      <text
                        fg={index === focusedTemplateIndex ? theme.accent : theme.text}
                        attributes={index === focusedTemplateIndex ? TextAttributes.BOLD : undefined}
                      >
                        {index === focusedTemplateIndex ? "▶ " : "  "}
                        {template.name}
                      </text>
                      <text fg={theme.textMuted} paddingLeft={3}>
                        {template.path}
                      </text>
                    </box>
                  ))}
                </box>
              </scrollbox>
            )}
          </box>
        </box>
      )
    }

    return (
      <box flexDirection="column" gap={1} flexGrow={1}>
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          Edit PR description:
        </text>
        <box borderStyle="single" borderColor={theme.border} flexGrow={1} padding={1}>
          <scrollbox
            verticalScrollbarOptions={{
              visible: true,
              trackOptions: {
                backgroundColor: theme.background,
                foregroundColor: theme.border,
              },
            }}
          >
            <textarea
              key={selectedTemplate?.path}
              ref={textareaRef}
              initialValue={editorContent}
              focused
              onContentChange={() => {
                const content = textareaRef.current?.plainText ?? ""
                onEditorChange(content)
              }}
            />
          </scrollbox>
        </box>
      </box>
    )
  }

  return (
    <box flexDirection="column" flexGrow={1}>
      <box
        flexDirection="row"
        borderStyle="single"
        borderColor={theme.border}
        flexGrow={1}
        overflow="hidden"
      >
        <box
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-start"
          width="30%"
          padding={0}
          flexShrink={0}
        >
          <Logo />
          <box flexDirection="row">
            <text attributes={TextAttributes.BOLD} fg={theme.text} wrapMode="none">
              {username ? "Welcome back, " : "Welcome!"}
            </text>
            {username && (
              <text attributes={TextAttributes.BOLD} fg="#FFFFFF" wrapMode="none">
                {username}!
              </text>
            )}
          </box>
          <text attributes={TextAttributes.BOLD} fg={theme.text} wrapMode="none">
            Lightning PR
          </text>
          {currentBranch && (
            <box flexDirection="row" gap={1} alignItems="center" flexWrap="no-wrap">
              <text fg={getBranchColor(theme, currentBranch)} wrapMode="none">
                {currentBranch}
              </text>
              <text fg={theme.textMuted} wrapMode="none">→</text>
              {selectedBranch ? (
                <text
                  fg={getBranchColor(theme, selectedBranch)}
                  attributes={TextAttributes.BOLD}
                  wrapMode="none"
                >
                  {selectedBranch}
                </text>
              ) : (
                <text fg={theme.textMuted} wrapMode="none">[selecting]</text>
              )}
            </box>
          )}

          <box paddingTop={1}>
            <text fg={theme.border} wrapMode="none">────────────────────</text>
          </box>

          <text attributes={TextAttributes.BOLD} fg={theme.info} wrapMode="none">
            Recent Activity
          </text>
          <box flexDirection="column" paddingLeft={1}>
            {recentPRs.length === 0 ? (
              <text fg={theme.textMuted} wrapMode="none">No recent PRs</text>
            ) : (
              <>
                <text fg={theme.textMuted} wrapMode="none">
                  • {recentPRs.length} PR{recentPRs.length !== 1 ? "s" : ""}{" "}
                  recently
                </text>
                {recentPRs[0] && (
                  <box flexDirection="row" gap={1} flexWrap="no-wrap">
                    <text fg={theme.textMuted} wrapMode="none">• Last:</text>
                    <text fg={getBranchColor(theme, recentPRs[0].headBranch)} wrapMode="none">
                      {recentPRs[0].headBranch}
                    </text>
                    <text fg={theme.textMuted} wrapMode="none">→</text>
                    <text fg={getBranchColor(theme, recentPRs[0].baseBranch)} wrapMode="none">
                      {recentPRs[0].baseBranch}
                    </text>
                  </box>
                )}
              </>
            )}
          </box>
        </box>

        <box
          width={1}
          borderStyle="single"
          borderColor={theme.border}
          border={["left"]}
        />

        <box
          flexDirection="column"
          width="70%"
          padding={1}
          gap={1}
          flexGrow={1}
        >
          {renderRightPane()}
        </box>
      </box>

      <KeyHints hints={hints} />
    </box>
  )
}
