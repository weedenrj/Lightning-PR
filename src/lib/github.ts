import { $ } from "bun"

export type PRInfo = {
  number: number
  title: string
  url: string
  headBranch: string
  baseBranch: string
  createdAt: string
}

export const getGitHubUser = async (): Promise<string | null> => {
  try {
    const result = await $`gh api user --jq '.login'`.text()
    return result.trim() || null
  } catch {
    return null
  }
}

export const getRecentPRs = async (limit = 5): Promise<PRInfo[]> => {
  try {
    const result =
      await $`gh pr list --author @me --limit ${limit} --json number,title,url,headRefName,baseRefName,createdAt`.text()
    const parsed = JSON.parse(result) as Array<{
      number: number
      title: string
      url: string
      headRefName: string
      baseRefName: string
      createdAt: string
    }>
    return parsed.map((pr) => ({
      number: pr.number,
      title: pr.title,
      url: pr.url,
      headBranch: pr.headRefName,
      baseBranch: pr.baseRefName,
      createdAt: pr.createdAt,
    }))
  } catch {
    return []
  }
}


