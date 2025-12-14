import { TextAttributes } from "@opentui/core"

interface StatusBarProps {
  status: "idle" | "creating" | "success" | "error"
  message?: string
  url?: string
}

export function StatusBar({ status, message, url }: StatusBarProps) {
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

  return (
    <box
      style={{
        backgroundColor: status === "error" ? "red" : "transparent",
      }}
      padding={1}
      borderStyle="single"
    >
      <text attributes={getAttributes()}>{getStatusText()}</text>
    </box>
  )
}
