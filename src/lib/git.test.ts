import { describe, test, expect } from "bun:test"
import {
  prioritizeBranches,
  getCurrentBranch,
  getRemoteBranches,
  getCompareUrl,
  isGitRepo,
} from "./git"

describe("prioritizeBranches", () => {
  test("puts develop first", () => {
    const result = prioritizeBranches(["main", "develop", "feature-x"])
    expect(result[0]).toBe("develop")
  })

  test("puts main second if develop exists", () => {
    const result = prioritizeBranches(["main", "develop", "feature-x"])
    expect(result[1]).toBe("main")
  })

  test("puts main first if develop doesn't exist", () => {
    const result = prioritizeBranches(["main", "feature-x", "master"])
    expect(result[0]).toBe("main")
  })

  test("puts master first if neither develop nor main exist", () => {
    const result = prioritizeBranches(["master", "feature-x"])
    expect(result[0]).toBe("master")
  })

  test("sorts other branches alphabetically", () => {
    const result = prioritizeBranches([
      "feature-z",
      "develop",
      "feature-a",
      "main",
    ])
    expect(result.slice(2)).toEqual(["feature-a", "feature-z"])
  })

  test("handles empty array", () => {
    const result = prioritizeBranches([])
    expect(result).toEqual([])
  })
})

describe("isGitRepo", () => {
  test("returns true in a git repository", async () => {
    const result = await isGitRepo()
    expect(result).toBe(true)
  })
})

describe("getCurrentBranch", () => {
  test("returns current branch name", async () => {
    const branch = await getCurrentBranch()
    expect(branch).toBeTruthy()
    expect(typeof branch).toBe("string")
  })
})

describe("getRemoteBranches", () => {
  test("returns array of remote branch names", async () => {
    const branches = await getRemoteBranches()
    expect(Array.isArray(branches)).toBe(true)
    branches.forEach((branch) => {
      expect(typeof branch).toBe("string")
      expect(branch).not.toContain("origin/")
      expect(branch).not.toContain("HEAD")
    })
  })
})

describe("getCompareUrl", () => {
  test("returns GitHub compare URL", async () => {
    const url = await getCompareUrl()
    if (url) {
      expect(url).toContain("github.com")
      expect(url).toContain("/compare")
    }
  })
})

