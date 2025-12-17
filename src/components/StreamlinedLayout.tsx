import { TextAttributes } from "@opentui/core"
import type { ReactNode } from "react"
import { useTheme } from "../context/theme"
import { KeyHints } from "./KeyHints"
import { PixelLoader } from "./PixelLoader"

type Hint = {
  key: string
  label: string
}

export type Breadcrumb = {
  label: string
  fg?: string
  attributes?: number
  showLoader?: boolean
}

interface StreamlinedLayoutProps {
  breadcrumbs: Breadcrumb[]
  hints: Hint[]
  children: ReactNode
}

export function StreamlinedLayout({
  breadcrumbs,
  hints,
  children,
}: StreamlinedLayoutProps) {
  const { theme } = useTheme()

  return (
    <box flexDirection="column" height="100%" width="100%">
      <box
        flexDirection="column"
        paddingLeft={1}
        paddingRight={1}
        height={2}
        width="100%"
        flexShrink={0}
      >
        <box flexDirection="row" gap={1} flexWrap="no-wrap" alignItems="center" height={1} width="100%">
          <text fg="#FFD700" wrapMode="none" selectable={false} attributes={TextAttributes.BOLD}>
            ⚡
          </text>
          <text fg={theme.accent} wrapMode="none" selectable={false} attributes={TextAttributes.BOLD}>
            Lightning PR
          </text>
        </box>

        <box flexDirection="row" gap={1} flexWrap="no-wrap" alignItems="center" height={1} width="100%">
          {breadcrumbs.map((crumb, index) => (
            <box key={`${crumb.label}-${index}`} flexDirection="row" gap={1} flexWrap="no-wrap">
              <text
                fg={crumb.fg ?? theme.textMuted}
                attributes={crumb.attributes}
                wrapMode="none"
              >
                {crumb.label}
              </text>
              {crumb.showLoader && <PixelLoader />}
              {index < breadcrumbs.length - 1 && (
                <text fg={theme.textMuted} wrapMode="none">
                  {">"}
                </text>
              )}
            </box>
          ))}
        </box>
      </box>

      <box flexGrow={1} flexShrink={1} minHeight={0} flexDirection="column" padding={1} overflow="hidden">
        {children}
      </box>

      <KeyHints hints={hints} />
    </box>
  )
}
