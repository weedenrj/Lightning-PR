import { FrameBufferRenderable, RGBA, type BoxRenderable } from "@opentui/core"
import { useRenderer } from "@opentui/react"
import { useEffect, useRef } from "react"
import { useTheme } from "../context/theme"

const WIDTH = 4
const HEIGHT = 1
const PENCIL = "✎"
const DOT = "."
const TOTAL_FRAMES = 6

export function PixelLoader() {
  const { theme } = useTheme()
  const renderer = useRenderer()
  const containerRef = useRef<BoxRenderable>(null)
  const bufferRef = useRef<FrameBufferRenderable | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const fb = new FrameBufferRenderable(renderer, {
      width: WIDTH,
      height: HEIGHT,
    })
    bufferRef.current = fb
    container.add(fb)

    const transparent = RGBA.fromValues(0, 0, 0, 0)
    const pencilColor = RGBA.fromHex(theme.accent)
    const dotColor = RGBA.fromHex(theme.textMuted)

    let frame = 0
    const interval = globalThis.setInterval(() => {
      const buffer = fb.frameBuffer

      for (let i = 0;i < WIDTH;i++) {
        buffer.setCell(i, 0, " ", transparent, transparent)
      }

      const phase = frame % TOTAL_FRAMES

      if (phase < 5) {
        const dotsToShow = phase >= 4 ? 3 : phase
        for (let i = 0;i < dotsToShow;i++) {
          buffer.setCell(i, 0, DOT, dotColor, transparent)
        }

        if (phase < 4) {
          buffer.setCell(phase, 0, PENCIL, pencilColor, transparent)
        }
      }

      frame++
      renderer.requestRender()
    }, 300)

    return () => {
      globalThis.clearInterval(interval)
      if (container && bufferRef.current) {
        container.remove(bufferRef.current.id)
      }
    }
  }, [renderer, theme.accent, theme.textMuted])

  return <box ref={containerRef} width={WIDTH} height={HEIGHT} flexShrink={0} />
}
