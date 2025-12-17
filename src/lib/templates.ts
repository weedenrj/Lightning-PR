import { readdir, readFile } from "fs/promises"
import { join } from "path"

export interface Template {
  name: string
  path: string
  content: string
}

const TEMPLATE_PATHS = [
  ".github/PULL_REQUEST_TEMPLATE",
  ".github/PULL_REQUEST_TEMPLATE.md",
  "PULL_REQUEST_TEMPLATE.md",
]

export const discoverTemplates = async (): Promise<Template[]> => {
  const templateGroups = await Promise.all(
    TEMPLATE_PATHS.map(async (templatePath) => {
      const stat = await Bun.file(templatePath).stat().catch(() => null)
      if (!stat) return []

      if (stat.isDirectory()) {
        const files = await readdir(templatePath)
        const markdownFiles = files.filter((file) => file.endsWith(".md"))

        return Promise.all(
          markdownFiles.map(async (file) => {
            const fullPath = join(templatePath, file)
            const content = await readFile(fullPath, "utf-8")
            return {
              name: file.replace(".md", ""),
              path: fullPath,
              content,
            }
          })
        )
      }

      if (stat.isFile()) {
        const content = await readFile(templatePath, "utf-8")
        return [
          {
            name: "Pull Request Template",
            path: templatePath,
            content,
          },
        ]
      }

      return []
    })
  )

  return templateGroups.flat()
}
