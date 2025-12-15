import { describe, test, expect } from "bun:test"
import { createPR, isGhInstalled, isGhAuthenticated } from "./pr"

describe("isGhInstalled", () => {
  test("returns boolean", async () => {
    const result = await isGhInstalled()
    expect(typeof result).toBe("boolean")
  })
})

describe("isGhAuthenticated", () => {
  test("returns boolean", async () => {
    const result = await isGhAuthenticated()
    expect(typeof result).toBe("boolean")
  })
})

describe("createPR", () => {
  test("returns result with success flag", async () => {
    const result = await createPR("main", "Test PR", "Test body")
    expect(result).toHaveProperty("success")
    expect(typeof result.success).toBe("boolean")
  })

  test("includes url when successful", async () => {
    const result = await createPR("main", "Test PR", "Test body")
    if (result.success) {
      expect(result.url).toBeDefined()
      if (result.url) {
        expect(result.url).toContain("github.com")
      }
    }
  })

  test("includes error when failed", async () => {
    const result = await createPR("nonexistent-branch", "Test PR", "Test body")
    if (!result.success) {
      expect(result.error).toBeDefined()
      expect(typeof result.error).toBe("string")
    }
  })
})
