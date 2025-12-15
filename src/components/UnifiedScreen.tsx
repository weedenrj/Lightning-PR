import { useRef, useState } from "react"
import { TextAttributes } from "@opentui/core"
import type { TextareaRenderable } from "@opentui/core"
import { useTheme, getBranchColor } from "../context/theme"
import { Logo } from "./Logo"
import { KeyHints } from "./KeyHints"
import { useKeyboard } from "@opentui/react"
import type { PRInfo } from "../lib/github"
import type { Template } from "../lib/templates"

interface UnifiedScreenProps {
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
    if (selectedTemplate) {
      if ((key.ctrl && key.name === "s") || (key.meta && key.name === "s")) {
        const content = textareaRef.current?.plainText ?? editorContent
        onSave(content)
        return
      }
      if ((key.ctrl && key.name === "b") || (key.meta && key.name === "b")) {
        onTemplateDeselect()
        return
      }
      if (key.name === "q" || key.name === "escape" || (key.ctrl && key.name === "c")) {
        onCancel()
        return
      }
      return
    }

    if ((key.ctrl && key.name === "s") || (key.meta && key.name === "s")) {
      return
    }
    if (key.name === "q" || key.name === "escape" || (key.ctrl && key.name === "c")) {
      onCancel()
      return
    }
    if (key.name === "left") {
      if (selectedBranch) {
        onBranchDeselect()
        return
      }
    }
    if (!selectedBranch) {
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
    if (selectedBranch && !selectedTemplate) {
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
  })

  const greeting = username ? `Welcome back, ${username}!` : "Welcome!"

  const hints = selectedTemplate
    ? [
      { key: "⌘S", label: "save & create" },
      { key: "⌘B", label: "back" },
      { key: "q", label: "quit" },
    ]
    : selectedBranch
      ? [
        { key: "↑↓", label: "navigate" },
        { key: "←→", label: "navigate" },
        { key: "q", label: "quit" },
      ]
      : [
        { key: "↑↓", label: "navigate" },
        { key: "→", label: "navigate" },
        { key: "q", label: "quit" },
      ]

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
          width={45}
          padding={1}
          gap={1}
          flexShrink={0}
        >
          <Logo />
          <text attributes={TextAttributes.BOLD} fg={theme.text} wrapMode="none">
            {greeting}
          </text>
          <text attributes={TextAttributes.BOLD} fg={theme.text} wrapMode="none">
            Create Pull Request
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
            <text fg={theme.border}>────────────────────</text>
          </box>

          <text attributes={TextAttributes.BOLD} fg={theme.text} wrapMode="none">
            EZ PR Templates
          </text>

          <box paddingTop={1}>
            <text fg={theme.border} wrapMode="none">────────────────────</text>
          </box>

          <text attributes={TextAttributes.BOLD} fg={theme.text} wrapMode="none">
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
          {!selectedBranch ? (
            <box flexDirection="column" gap={1} flexGrow={1}>
              <text attributes={TextAttributes.BOLD} fg={theme.text}>
                Select target branch:
              </text>
              <box
                borderStyle="single"
                borderColor={theme.border}
                flexGrow={1}
                padding={1}
              >
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
                          attributes={
                            index === focusedBranchIndex
                              ? TextAttributes.BOLD
                              : undefined
                          }
                        >
                          {index === focusedBranchIndex ? "▶ " : "  "}
                          {branch}
                        </text>
                      </box>
                    ))}
                  </box>
                </scrollbox>
              </box>
            </box>
          ) : !selectedTemplate ? (
            <box flexDirection="column" gap={1} flexGrow={1}>
              <text attributes={TextAttributes.BOLD} fg={theme.text}>
                Select template:
              </text>
              <box
                borderStyle="single"
                borderColor={theme.border}
                flexGrow={1}
                padding={1}
              >
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
                          fg={
                            index === focusedTemplateIndex
                              ? theme.accent
                              : theme.text
                          }
                          attributes={
                            index === focusedTemplateIndex
                              ? TextAttributes.BOLD
                              : undefined
                          }
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
              </box>
            </box>
          ) : (
            <box flexDirection="column" gap={1} flexGrow={1}>
              <text attributes={TextAttributes.BOLD} fg={theme.text}>
                Edit PR description:
              </text>
              <box
                borderStyle="single"
                borderColor={theme.border}
                flexGrow={1}
                padding={1}
              >
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
          )}
        </box>
      </box>

      <KeyHints hints={hints} />
    </box>
  )
}
