import { exists, readdir, readFile } from "fs/promises"
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
  const templates: Template[] = []

  for (const templatePath of TEMPLATE_PATHS) {
    if (await exists(templatePath)) {
      const stat = await Bun.file(templatePath).stat()
      if (stat.isDirectory()) {
        const files = await readdir(templatePath)
        for (const file of files) {
          if (file.endsWith(".md")) {
            const fullPath = join(templatePath, file)
            const content = await readFile(fullPath, "utf-8")
            templates.push({
              name: file.replace(".md", ""),
              path: fullPath,
              content,
            })
          }
        }
      } else if (stat.isFile()) {
        const content = await readFile(templatePath, "utf-8")
        templates.push({
          name: "Pull Request Template",
          path: templatePath,
          content,
        })
      }
    }
  }

  return templates
}
