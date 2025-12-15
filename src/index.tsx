import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { useState } from "react"
import { $ } from "bun"
import { mkdir, writeFile } from "fs/promises"
import { StatusBar } from "./components/StatusBar"
import { ErrorScreen, type ErrorReason } from "./components/ErrorScreen"
import { UnifiedScreen } from "./components/UnifiedScreen"
import { SuccessScreen } from "./components/SuccessScreen"
import { FailedScreen } from "./components/FailedScreen"
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

type AppState =
  | {
    type: "unified"
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
  | { type: "error"; reason: ErrorReason; compareUrl: string | null }
  | { type: "creating"; currentBranch: string | null; targetBranch: string }
  | { type: "success"; url: string }
  | { type: "failed"; error: string; compareUrl: string | null }

const initializeAppState = async (): Promise<AppState> => {
  if (!(await isGitRepo())) {
    return { type: "error", reason: "not-git-repo", compareUrl: null }
  }

  if (!(await isGhInstalled())) {
    return {
      type: "error",
      reason: "gh-not-installed",
      compareUrl: await getCompareUrl(),
    }
  }

  if (!(await isGhAuthenticated())) {
    return {
      type: "error",
      reason: "gh-not-authenticated",
      compareUrl: await getCompareUrl(),
    }
  }

  const templates = await discoverTemplates()
  if (templates.length === 0) {
    return {
      type: "error",
      reason: "no-templates",
      compareUrl: await getCompareUrl(),
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
    repoPath: process.cwd(),
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

const cleanup = (code = 0) => {
  const rendererWithDestroy = renderer as typeof renderer & {
    destroy?: () => void
  }
  if (typeof rendererWithDestroy.destroy === "function") {
    rendererWithDestroy.destroy()
  }
  process.exit(code)
}

process.on("SIGINT", () => cleanup(0))
process.on("SIGTERM", () => cleanup(0))

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
        type: "failed",
        error: "No target branch selected. Please select a branch first.",
        compareUrl,
      })
      return
    }

    if (!state.selectedTemplate) {
      const compareUrl = await getCompareUrl()
      setState({
        type: "failed",
        error: "No template selected. Please select a template first.",
        compareUrl,
      })
      return
    }

    setState({
      type: "creating",
      currentBranch: state.currentBranch,
      targetBranch: state.selectedBranch,
    })

    const titleMatch = content.match(/^#\s*(.+)$/m)
    const title = titleMatch
      ? titleMatch[1]!.trim()
      : `PR from ${state.currentBranch || "current branch"}`

    const result = await createPR(state.selectedBranch, title, content)

    if (result.success && result.url) {
      setState({ type: "success", url: result.url })
      setTimeout(() => exit(0), 3000)
    } else {
      const compareUrl = await getCompareUrl()
      setState({
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
        await $`open https://cli.github.com`.quiet().catch(() => { })
        exit(0)
        break
      case "gh-not-authenticated":
        await $`gh auth login`.quiet().catch(() => { })
        exit(0)
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

  if (state.type === "unified") {
    return (
      <UnifiedScreen
        username={state.username}
        currentBranch={state.currentBranch}
        recentPRs={state.recentPRs}
        branches={state.branches}
        templates={state.templates}
        selectedBranch={state.selectedBranch}
        selectedTemplate={state.selectedTemplate}
        editorContent={state.editorContent}
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

  if (state.type === "error") {
    return (
      <ErrorScreen
        reason={state.reason}
        compareUrl={state.compareUrl}
        onAction={handleErrorAction}
        onQuit={handleCancel}
      />
    )
  }

  if (state.type === "success") {
    return <SuccessScreen url={state.url} onQuit={handleCancel} />
  }

  if (state.type === "failed") {
    return (
      <FailedScreen
        error={state.error}
        compareUrl={state.compareUrl}
        onQuit={handleCancel}
      />
    )
  }

  if (state.type === "creating") {
    return <StatusBar />
  }

  return null
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
