import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"
import { KeyHints } from "./KeyHints"
import { useTheme } from "../context/theme"

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

const getErrorContent = (reason: ErrorReason, compareUrl: string | null) => {
  switch (reason) {
    case "not-git-repo":
      return {
        title: "Not a Git Repository",
        message: "This directory is not a git repository.",
        help: "Navigate to a git repository and try again.",
        hasAction: false,
      }
    case "gh-not-installed":
      return {
        title: "GitHub CLI Not Installed",
        message: "GitHub CLI (gh) is required to create pull requests.",
        help: "Would you like to open the installation page?",
        hasAction: true,
        actionLabel: "open install page",
      }
    case "gh-not-authenticated":
      return {
        title: "GitHub CLI Not Authenticated",
        message: "You need to authenticate with GitHub CLI first.",
        help: "Would you like to run 'gh auth login'?",
        hasAction: true,
        actionLabel: "run auth login",
      }
    case "no-templates":
      return {
        title: "No PR Templates Found",
        message: "No pull request templates were found in this repository.",
        help: "Would you like to create a default template?",
        hasAction: true,
        actionLabel: "create template",
        fallback: compareUrl
          ? `Create a PR manually: ${compareUrl}`
          : null,
      }
    case "no-branches":
      return {
        title: "No Remote Branches Found",
        message: "No remote branches were found to merge into.",
        help: "Make sure you've pushed your branch and that the remote is configured.",
        hasAction: false,
        fallback: compareUrl
          ? `Create a PR manually: ${compareUrl}`
          : null,
      }
  }
}

export function ErrorScreen({
  reason,
  compareUrl,
  onAction,
  onQuit,
}: ErrorScreenProps) {
  const { theme } = useTheme()
  const content = getErrorContent(reason, compareUrl)

  useKeyboard((key) => {
    if (
      key.name === "q" ||
      key.name === "escape" ||
      (key.ctrl && key.name === "c")
    ) {
      onQuit()
      return
    }

    if (content.hasAction && onAction) {
      if (key.name === "y" || key.name === "return" || key.name === "enter") {
        onAction()
        return
      }

      if (key.name === "n") {
        onQuit()
        return
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
    <box
      flexDirection="column"
      flexGrow={1}
      gap={1}
      padding={2}
      borderStyle="single"
      borderColor={theme.error}
      backgroundColor={theme.backgroundPanel}
    >
      <box flexDirection="column" gap={1}>
        <box flexDirection="row" gap={1} alignItems="center">
          <text fg={theme.error}>✗</text>
          <text attributes={TextAttributes.BOLD} fg={theme.error}>
            {content.title}
          </text>
        </box>
        <text fg={theme.text}>{content.message}</text>
        <text attributes={TextAttributes.DIM} fg={theme.textMuted}>
          {content.help}
        </text>
        {content.fallback && (
          <box flexDirection="column" gap={1} paddingTop={1}>
            <box
              backgroundColor={theme.backgroundElement}
              padding={1}
              borderStyle="single"
              borderColor={theme.borderActive}
            >
              <text fg={theme.accent}>{content.fallback}</text>
            </box>
          </box>
        )}
      </box>
      <KeyHints hints={hints} />
    </box>
  )
}