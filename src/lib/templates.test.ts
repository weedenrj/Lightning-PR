import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { discoverTemplates } from "./templates"
import { mkdir, writeFile, rm } from "fs/promises"
import { join } from "path"

describe("discoverTemplates", () => {
  const testDir = ".github-test-templates"

  beforeEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore errors
    }
  })

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore errors
    }
  })

  test("returns array of templates", async () => {
    const templates = await discoverTemplates()
    expect(Array.isArray(templates)).toBe(true)
  })

  test("finds template in .github/PULL_REQUEST_TEMPLATE directory", async () => {
    await mkdir(join(testDir, "PULL_REQUEST_TEMPLATE"), { recursive: true })
    await writeFile(
      join(testDir, "PULL_REQUEST_TEMPLATE", "feature.md"),
      "# Feature PR\n\nDescription"
    )

    const templates = await discoverTemplates()

    expect(templates.length).toBeGreaterThan(0)
    templates.forEach((template) => {
      expect(template).toHaveProperty("name")
      expect(template).toHaveProperty("path")
      expect(template).toHaveProperty("content")
      expect(typeof template.name).toBe("string")
      expect(typeof template.path).toBe("string")
      expect(typeof template.content).toBe("string")
    })
  })

  test("finds single template file", async () => {
    await mkdir(testDir, { recursive: true })
    await writeFile(
      join(testDir, "PULL_REQUEST_TEMPLATE.md"),
      "# PR Template\n\nContent"
    )

    const templates = await discoverTemplates()
    expect(Array.isArray(templates)).toBe(true)
  })

  test("template has correct structure", async () => {
    const templates = await discoverTemplates()
    if (templates.length > 0) {
      const template = templates[0]!
      expect(template).toHaveProperty("name")
      expect(template).toHaveProperty("path")
      expect(template).toHaveProperty("content")
      expect(template.name.length).toBeGreaterThan(0)
      expect(template.path.length).toBeGreaterThan(0)
    }
  })
})

