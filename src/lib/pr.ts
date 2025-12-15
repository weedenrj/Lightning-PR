import { $ } from "bun"
import { tmpdir } from "os"
import { join } from "path"

export interface CreatePRResult {
  success: boolean
  url?: string
  error?: string
}

export const createPR = async (
  baseBranch: string,
  title: string,
  body: string
): Promise<CreatePRResult> => {
  try {
    const tempFile = join(tmpdir(), `pr-body-${Date.now()}.md`)
    await Bun.write(tempFile, body)

    const result = await $`gh pr create --base ${baseBranch} --title ${title} --body-file ${tempFile}`.nothrow()

    if (result.exitCode !== 0) {
      const stderr = result.stderr.toString()
      const stdout = result.stdout.toString()
      const errorMsg = stderr || stdout || "Failed to create PR"
      return {
        success: false,
        error: errorMsg.trim(),
      }
    }

    const output = result.stdout.toString()
    const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+/)
    const url = urlMatch ? urlMatch[0] : undefined

    if (!url) {
      return {
        success: false,
        error: `PR creation output: ${output.trim() || "No output"}. URL not found.`,
      }
    }

    return {
      success: true,
      url,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const isGhInstalled = async (): Promise<boolean> => {
  try {
    await $`gh --version`.quiet()
    return true
  } catch {
    return false
  }
}

export const isGhAuthenticated = async (): Promise<boolean> => {
  try {
    await $`gh auth status`.quiet()
    return true
  } catch {
    return false
  }
}
