#!/usr/bin/env bun

import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { useState } from "react"
import { $ } from "bun"
import { mkdir, writeFile } from "fs/promises"
import { UnifiedScreen, type ScreenStatus } from "./components/UnifiedScreen"
import {
  isGitRepo,
  getCurrentBranch,
  getRemoteBranches,
  prioritizeBranches,
  getCompareUrl,
} from "./lib/git"
import { discoverTemplates, type Template } from "./lib/templates"
import { createPR, isGhInstalled, isGhAuthenticated } from "./lib/pr"
import { getGitHubUser, getRecentPRs, type PRInfo } from "./lib/github"
import { ExitProvider, useExit } from "./context/exit"
import { ThemeProvider } from "./context/theme"
import { type ErrorReason } from "./lib/errors"

type UnifiedData = {
  username: string | null
  currentBranch: string | null
  repoPath: string
  recentPRs: PRInfo[]
  branches: string[]
  templates: Template[]
  selectedBranch: string | null
  selectedTemplate: Template | null
  editorContent: string
}

type AppState =
  | ({ type: "unified" } & UnifiedData)
  | { type: "error"; reason: ErrorReason; compareUrl: string | null; repoPath: string }
  | ({ type: "creating"; targetBranch: string } & UnifiedData)
  | ({ type: "success"; url: string } & UnifiedData)
  | ({ type: "failed"; error: string; compareUrl: string | null } & UnifiedData)

const initializeAppState = async (): Promise<AppState> => {
  const repoPath = process.cwd()

  if (!(await isGitRepo())) {
    return { type: "error", reason: "not-git-repo", compareUrl: null, repoPath }
  }

  if (!(await isGhInstalled())) {
    return {
      type: "error",
      reason: "gh-not-installed",
      compareUrl: await getCompareUrl(),
      repoPath,
    }
  }

  if (!(await isGhAuthenticated())) {
    return {
      type: "error",
      reason: "gh-not-authenticated",
      compareUrl: await getCompareUrl(),
      repoPath,
    }
  }

  const templates = await discoverTemplates()
  if (templates.length === 0) {
    return {
      type: "error",
      reason: "no-templates",
      compareUrl: await getCompareUrl(),
      repoPath,
    }
  }

  const currentBranch = await getCurrentBranch()
  const branches = await getRemoteBranches()
  const prioritizedBranches = prioritizeBranches(branches)

  if (prioritizedBranches.length === 0) {
    return {
      type: "error",
      reason: "no-branches",
      compareUrl: await getCompareUrl(),
      repoPath,
    }
  }

  const [username, recentPRs] = await Promise.all([
    getGitHubUser(),
    getRecentPRs(5),
  ])

  return {
    type: "unified",
    username,
    currentBranch,
    repoPath,
    recentPRs,
    branches: prioritizedBranches,
    templates,
    selectedBranch: null,
    selectedTemplate: null,
    editorContent: "",
  }
}

const renderer = await createCliRenderer({
  useMouse: true,
  exitOnCtrlC: false,
})
const initialState = await initializeAppState()

const destroyRenderer = () => {
  const rendererWithDestroy = renderer as typeof renderer & {
    destroy?: () => void
  }
  if (typeof rendererWithDestroy.destroy === "function") {
    rendererWithDestroy.destroy()
  }
}

const cleanup = (code = 0) => {
  destroyRenderer()
  process.exit(code)
}

const handleExitSignal = () => cleanup(0)

process.on("SIGINT", handleExitSignal)
process.on("SIGTERM", handleExitSignal)

const runInteractiveCommand = async (cmd: string[]): Promise<number> => {
  process.off("SIGINT", handleExitSignal)
  process.off("SIGTERM", handleExitSignal)
  destroyRenderer()

  try {
    const subprocess = Bun.spawn(cmd, {
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    })
    return await subprocess.exited
  } catch {
    return 1
  } finally {
    process.on("SIGINT", handleExitSignal)
    process.on("SIGTERM", handleExitSignal)
  }
}

function App({ initialState }: { initialState: AppState }) {
  const [state, setState] = useState<AppState>(initialState)
  const exit = useExit()

  const handleBranchSelect = (branch: string) => {
    if (state.type === "unified") {
      const template = state.templates.length === 1 ? state.templates[0]! : null
      setState({
        ...state,
        selectedBranch: branch,
        selectedTemplate: template,
        editorContent: template ? template.content : "",
      })
    }
  }

  const handleTemplateSelect = (template: Template) => {
    if (state.type === "unified") {
      setState({
        ...state,
        selectedTemplate: template,
        editorContent: template.content,
      })
    }
  }

  const handleTemplateDeselect = () => {
    if (state.type === "unified") {
      setState({
        ...state,
        selectedTemplate: null,
        editorContent: "",
      })
    }
  }

  const handleBranchDeselect = () => {
    if (state.type === "unified") {
      setState({
        ...state,
        selectedBranch: null,
        selectedTemplate: null,
        editorContent: "",
      })
    }
  }

  const handleEditorChange = (content: string) => {
    if (state.type === "unified") {
      setState({
        ...state,
        editorContent: content,
      })
    }
  }

  const handleSave = async (content: string) => {
    if (state.type !== "unified") return

    if (!state.selectedBranch) {
      const compareUrl = await getCompareUrl()
      setState({
        ...state,
        type: "failed",
        error: "No target branch selected. Please select a branch first.",
        compareUrl,
      })
      return
    }

    if (!state.selectedTemplate) {
      const compareUrl = await getCompareUrl()
      setState({
        ...state,
        type: "failed",
        error: "No template selected. Please select a template first.",
        compareUrl,
      })
      return
    }

    setState({
      ...state,
      type: "creating",
      targetBranch: state.selectedBranch,
    })

    const titleMatch = content.match(/^#\s*(.+)$/m)
    const title = titleMatch
      ? titleMatch[1]!.trim()
      : `PR from ${state.currentBranch || "current branch"}`

    const result = await createPR(state.selectedBranch, title, content)

    if (result.success && result.url) {
      setState({ ...state, type: "success", url: result.url })
      setTimeout(() => exit(0), 3000)
    } else {
      const compareUrl = await getCompareUrl()
      setState({
        ...state,
        type: "failed",
        error: result.error || "Failed to create PR",
        compareUrl,
      })
    }
  }

  const handleCancel = () => exit(0)

  const handleErrorAction = async () => {
    if (state.type !== "error") return

    switch (state.reason) {
      case "gh-not-installed":
        await $`open https://cli.github.com`.quiet().catch(() => undefined)
        exit(0)
        break
      case "gh-not-authenticated":
        {
          const code = await runInteractiveCommand(["gh", "auth", "login"])
          exit(code === 0 ? 0 : 1)
        }
        break
      case "no-templates":
        {
          await mkdir(".github", { recursive: true })
          const defaultTemplate = `# Pull Request

## Description

<!-- Describe your changes here -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
`
          await writeFile(".github/PULL_REQUEST_TEMPLATE.md", defaultTemplate)
            .then(() => exit(0))
            .catch(() => exit(1))
          break
        }
      default:
        exit(0)
    }
  }

  const data: UnifiedData =
    state.type === "error"
      ? {
        username: null,
        currentBranch: null,
        repoPath: state.repoPath,
        recentPRs: [],
        branches: [],
        templates: [],
        selectedBranch: null,
        selectedTemplate: null,
        editorContent: "",
      }
      : {
        username: state.username,
        currentBranch: state.currentBranch,
        repoPath: state.repoPath,
        recentPRs: state.recentPRs,
        branches: state.branches,
        templates: state.templates,
        selectedBranch: state.selectedBranch,
        selectedTemplate: state.selectedTemplate,
        editorContent: state.editorContent,
      }

  const status: ScreenStatus =
    state.type === "error"
      ? { type: "error", reason: state.reason, compareUrl: state.compareUrl, onAction: handleErrorAction }
      : state.type === "creating"
        ? { type: "creating" }
        : state.type === "success"
          ? { type: "success", url: state.url }
          : state.type === "failed"
            ? { type: "failed", error: state.error, compareUrl: state.compareUrl }
            : state.selectedTemplate
              ? { type: "editing" }
              : state.selectedBranch
                ? { type: "selecting-template" }
                : { type: "selecting-branch" }

  return (
    <UnifiedScreen
      status={status}
      username={data.username}
      currentBranch={data.currentBranch}
      recentPRs={data.recentPRs}
      branches={data.branches}
      templates={data.templates}
      selectedBranch={data.selectedBranch}
      selectedTemplate={data.selectedTemplate}
      editorContent={data.editorContent}
      onBranchSelect={handleBranchSelect}
      onBranchDeselect={handleBranchDeselect}
      onTemplateSelect={handleTemplateSelect}
      onTemplateDeselect={handleTemplateDeselect}
      onEditorChange={handleEditorChange}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}

function AppWithProviders({ initialState }: { initialState: AppState }) {
  return (
    <ExitProvider onExit={cleanup}>
      <ThemeProvider>
        <App initialState={initialState} />
      </ThemeProvider>
    </ExitProvider>
  )
}

const root = createRoot(renderer)
root.render(<AppWithProviders initialState={initialState} />)
