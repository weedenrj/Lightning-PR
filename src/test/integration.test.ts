import { describe, test, expect } from "bun:test"

const mockBranches = ["develop", "main", "feature-x"]

describe("Git Integration", () => {
  test("getRemoteBranches returns array", async () => {
    const { getRemoteBranches } = await import("../lib/git")
    const branches = await getRemoteBranches()
    expect(Array.isArray(branches)).toBe(true)
  })

  test("prioritizeBranches works correctly", async () => {
    const { prioritizeBranches } = await import("../lib/git")
    const result = prioritizeBranches(mockBranches)
    expect(result[0]).toBe("develop")
    expect(result[1]).toBe("main")
  })

  test("getCurrentBranch returns string or null", async () => {
    const { getCurrentBranch } = await import("../lib/git")
    const branch = await getCurrentBranch()
    expect(branch === null || typeof branch === "string").toBe(true)
  })
})

describe("Template Discovery", () => {
  test("discoverTemplates returns array", async () => {
    const { discoverTemplates } = await import("../lib/templates")
    const templates = await discoverTemplates()
    expect(Array.isArray(templates)).toBe(true)
  })
})

describe("PR Creation", () => {
  test.skip("createPR returns result object", async () => {
    const { createPR } = await import("../lib/pr")
    const result = await createPR("main", "Test PR", "Test body")
    expect(result).toHaveProperty("success")
    expect(typeof result.success).toBe("boolean")
  })
})
