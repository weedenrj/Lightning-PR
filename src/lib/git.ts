import { $ } from "bun"

export const getCurrentBranch = async (): Promise<string | null> => {
  try {
    const branch = await $`git branch --show-current`.text()
    return branch.trim() || null
  } catch {
    return null
  }
}

export const getCompareUrl = async (): Promise<string | null> => {
  try {
    const remote = await $`git remote get-url origin`.text()
    if (!remote) return null

    const match = remote.trim().match(/github\.com[:/](.+?)(?:\.git)?$/)
    if (!match || !match[1]) return null

    return `https://github.com/${match[1].trim()}/compare`
  } catch {
    return null
  }
}

export const getRemoteBranches = async (): Promise<string[]> => {
  try {
    const output = await $`git branch -r`.text()
    const branches = output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("origin/") && !line.includes("HEAD"))
      .map((line) => line.replace(/^origin\//, ""))
      .filter((branch) => branch.length > 0)

    return branches
  } catch {
    return []
  }
}

export const prioritizeBranches = (branches: string[]): string[] => {
  const develop = branches.find((b) => b === "develop")
  const main = branches.find((b) => b === "main")
  const master = branches.find((b) => b === "master")

  const others = branches.filter(
    (b) => b !== "develop" && b !== "main" && b !== "master"
  )

  const prioritized: string[] = []

  if (develop) prioritized.push(develop)
  if (main) prioritized.push(main)
  else if (master) prioritized.push(master)

  prioritized.push(...others.sort())

  return prioritized
}

export const isGitRepo = async (): Promise<boolean> => {
  try {
    await $`git rev-parse --git-dir`.quiet()
    return true
  } catch {
    return false
  }
}
