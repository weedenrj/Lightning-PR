import { TextAttributes } from "@opentui/core"
import { useTheme } from "../context/theme"

interface StatusBarProps {
  status: "idle" | "creating" | "success" | "error"
  message?: string
  url?: string
}

export function StatusBar({ status, message, url }: StatusBarProps) {
  const { theme } = useTheme()

  const getStatusIcon = () => {
    switch (status) {
      case "creating":
        return "◐"
      case "success":
        return "✓"
      case "error":
        return "✗"
      default:
        return "○"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "creating":
        return "Creating pull request..."
      case "success":
        return url ? `PR created: ${url}` : "PR created successfully"
      case "error":
        return message ? `Error: ${message}` : "An error occurred"
      default:
        return message || ""
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "creating":
        return theme.info
      case "success":
        return theme.success
      case "error":
        return theme.error
      default:
        return theme.textMuted
    }
  }

  const getAttributes = () => {
    switch (status) {
      case "success":
        return TextAttributes.BOLD
      case "error":
        return TextAttributes.BOLD
      default:
        return TextAttributes.DIM
    }
  }

  const statusColor = getStatusColor()

  return (
    <box
      backgroundColor={theme.backgroundPanel}
      padding={1}
      borderStyle="single"
      borderColor={statusColor}
      flexDirection="row"
      gap={1}
      alignItems="center"
    >
      <text fg={statusColor}>{getStatusIcon()}</text>
      <text attributes={getAttributes()} fg={statusColor}>
        {getStatusText()}
      </text>
    </box>
  )
}
