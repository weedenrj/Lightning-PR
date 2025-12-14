import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"

interface EditorProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
}

export function Editor({ initialContent, onSave, onCancel }: EditorProps) {
  const [content, setContent] = useState(initialContent)
  const [cursorRow, setCursorRow] = useState(0)
  const [cursorCol, setCursorCol] = useState(0)

  const lines = content.split("\n")
  const maxCol = lines[cursorRow]?.length ?? 0
  const adjustedCursorCol = cursorCol > maxCol ? maxCol : cursorCol

  useKeyboard((key) => {
    if ((key.ctrl && key.name === "s") || (key.meta && key.name === "s")) {
      onSave(content)
      return
    }

    if (key.name === "escape") {
      onCancel()
      return
    }

    if (key.name === "up" || key.name === "k") {
      setCursorRow((prev) => Math.max(0, prev - 1))
      setCursorCol((prev) =>
        Math.min(prev, lines[Math.max(0, cursorRow - 1)]?.length ?? 0)
      )
    } else if (key.name === "down" || key.name === "j") {
      setCursorRow((prev) => Math.min(lines.length - 1, prev + 1))
      setCursorCol((prev) =>
        Math.min(prev, lines[Math.min(lines.length - 1, cursorRow + 1)]?.length ?? 0)
      )
    } else if (key.name === "left" || key.name === "h") {
      setCursorCol((prev) => Math.max(0, prev - 1))
    } else if (key.name === "right" || key.name === "l") {
      const maxCol = lines[cursorRow]?.length ?? 0
      setCursorCol((prev) => Math.min(maxCol, prev + 1))
    } else if (key.name === "return" || key.name === "enter") {
      const newLines = [...lines]
      const currentLine = newLines[cursorRow] ?? ""
      const before = currentLine.slice(0, cursorCol)
      const after = currentLine.slice(cursorCol)
      newLines[cursorRow] = before
      newLines.splice(cursorRow + 1, 0, after)
      setContent(newLines.join("\n"))
      setCursorRow((prev) => prev + 1)
      setCursorCol(0)
    } else if (key.name === "backspace") {
      if (cursorCol > 0) {
        const newLines = [...lines]
        const currentLine = newLines[cursorRow] ?? ""
        newLines[cursorRow] =
          currentLine.slice(0, cursorCol - 1) + currentLine.slice(cursorCol)
        setContent(newLines.join("\n"))
        setCursorCol((prev) => prev - 1)
      } else if (cursorRow > 0) {
        const newLines = [...lines]
        const prevLine = newLines[cursorRow - 1] ?? ""
        const currentLine = newLines[cursorRow] ?? ""
        newLines[cursorRow - 1] = prevLine + currentLine
        newLines.splice(cursorRow, 1)
        setContent(newLines.join("\n"))
        setCursorRow((prev) => prev - 1)
        setCursorCol(prevLine.length)
      }
    } else if (key.sequence && key.sequence.length === 1) {
      const newLines = [...lines]
      const currentLine = newLines[cursorRow] ?? ""
      newLines[cursorRow] =
        currentLine.slice(0, cursorCol) +
        key.sequence +
        currentLine.slice(cursorCol)
      setContent(newLines.join("\n"))
      setCursorCol((prev) => prev + 1)
    }
  })

  return (
    <box flexDirection="column" flexGrow={1} gap={1}>
      <text attributes={TextAttributes.BOLD}>Edit PR description:</text>
      <box
        borderStyle="single"
        flexGrow={1}
        style={{ maxHeight: 20 }}
        padding={1}
      >
        <box flexDirection="column" gap={0}>
          {lines.map((line, row) => (
            <box key={row} flexDirection="row">
              <text
                attributes={TextAttributes.DIM}
                style={{ width: 4 }}
              >
                {String(row + 1).padStart(3, " ")}
              </text>
              <text style={{ marginLeft: 1 }}>
                {row === cursorRow ? (
                  <>
                    {line.slice(0, adjustedCursorCol)}
                    <text
                      attributes={TextAttributes.INVERSE}
                    >
                      {line[adjustedCursorCol] || " "}
                    </text>
                    {line.slice(adjustedCursorCol + 1)}
                  </>
                ) : (
                  line
                )}
              </text>
            </box>
          ))}
          {cursorRow >= lines.length && (
            <box flexDirection="row">
              <text
                attributes={TextAttributes.DIM}
                style={{ width: 4 }}
              >
                {String(lines.length + 1).padStart(3, " ")}
              </text>
              <text style={{ marginLeft: 1 }}>
                <text attributes={TextAttributes.INVERSE}>
                  {" "}
                </text>
              </text>
            </box>
          )}
        </box>
      </box>
      <text attributes={TextAttributes.DIM}>
        Cmd+S to save and create PR, Escape to cancel
      </text>
    </box>
  )
}
