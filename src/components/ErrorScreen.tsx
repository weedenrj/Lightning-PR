import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"
import { KeyHints } from "./KeyHints"

export type ErrorReason =
  | "not-git-repo"
  | "gh-not-installed"
  | "gh-not-authenticated"
  | "no-templates"
  | "no-branches"

interface ErrorScreenProps {
  reason: ErrorReason
  compareUrl: string | null
  onAction?: () => void
  onQuit: () => void
}

const getErrorContent = (reason: ErrorReason) => {
  switch (reason) {
    case "not-git-repo":
      return {
        title: "Not a Git Repository",
        message: "Navigate to a git repository and try again.",
        hasAction: false,
      }
    case "gh-not-installed":
      return {
        title: "GitHub CLI Not Installed",
        message: "Install gh CLI to continue.",
        hasAction: true,
        actionLabel: "open install page",
      }
    case "gh-not-authenticated":
      return {
        title: "GitHub CLI Not Authenticated",
        message: "Run 'gh auth login' to authenticate.",
        hasAction: true,
        actionLabel: "run auth",
      }
    case "no-templates":
      return {
        title: "No PR Templates Found",
        message: "No templates found in this repository.",
        hasAction: true,
        actionLabel: "create template",
      }
    case "no-branches":
      return {
        title: "No Remote Branches",
        message: "Push your branch and configure remote.",
        hasAction: false,
      }
  }
}

export function ErrorScreen({ reason, compareUrl, onAction, onQuit }: ErrorScreenProps) {
  const { theme } = useTheme()
  const content = getErrorContent(reason)

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape" || (key.ctrl && key.name === "c")) {
      onQuit()
      return
    }
    if (content.hasAction && onAction) {
      if (key.name === "y" || key.name === "return") {
        onAction()
        return
      }
      if (key.name === "n") {
        onQuit()
      }
    }
  })

  const hints: Array<{ key: string; label: string }> = []
  if (content.hasAction && onAction) {
    hints.push({ key: "y", label: content.actionLabel || "yes" })
    hints.push({ key: "n", label: "no" })
  }
  hints.push({ key: "q", label: "quit" })

  return (
    <box flexDirection="column" flexGrow={1} gap={1} padding={2}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.error}>✗</text>
        <text attributes={TextAttributes.BOLD} fg={theme.error}>
          {content.title}
        </text>
      </box>
      <text fg={theme.text}>{content.message}</text>
      {compareUrl && (
        <box paddingTop={1}>
          <text fg={theme.accent}>{compareUrl}</text>
        </box>
      )}
      <KeyHints hints={hints} />
    </box>
  )
}
