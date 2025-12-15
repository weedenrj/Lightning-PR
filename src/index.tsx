import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { useState } from "react"
import { $ } from "bun"
import { mkdir, writeFile } from "fs/promises"
import { Header } from "./components/Header"
import { BranchPicker } from "./components/BranchPicker"
import { TemplatePicker } from "./components/TemplatePicker"
import { Editor } from "./components/Editor"
import { StatusBar } from "./components/StatusBar"
import { ErrorScreen, type ErrorReason } from "./components/ErrorScreen"
import { WelcomeScreen } from "./components/WelcomeScreen"
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
import { ExitProvider, useExit } from "./context/exit"
import { ThemeProvider, useTheme } from "./context/theme"

type AppState =
  | { type: "loading" }
  | { type: "error"; reason: ErrorReason; compareUrl: string | null }
  | {
    type: "branch-select"
    currentBranch: string | null
    branches: string[]
    templates: Template[]
  }
  | {
    type: "template-select"
    currentBranch: string | null
    targetBranch: string
    templates: Template[]
  }
  | {
    type: "editing"
    currentBranch: string | null
    targetBranch: string
    template: Template
  }
  | { type: "creating"; currentBranch: string | null; targetBranch: string }
  | { type: "success"; url: string }
  | { type: "failed"; error: string; compareUrl: string | null }

const initializeAppState = async (): Promise<AppState> => {
  if (!(await isGitRepo())) {
    return {
      type: "error",
      reason: "not-git-repo",
      compareUrl: null,
    }
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

  return {
    type: "branch-select",
    currentBranch,
    branches: prioritizedBranches,
    templates,
  }
}


const renderer = await createCliRenderer({
  useMouse: true,
  exitOnCtrlC: false,
})
const initialState = await initializeAppState()

const cleanup = (code = 0) => {
  const rendererWithDestroy = renderer as typeof renderer & { destroy?: () => void }
  if (typeof rendererWithDestroy.destroy === "function") {
    rendererWithDestroy.destroy()
  }
  process.exit(code)
}

process.on("SIGINT", () => {
  cleanup(0)
})

process.on("SIGTERM", () => {
  cleanup(0)
})

function App({ initialState }: { initialState: AppState }) {
  const [state, setState] = useState<AppState>(initialState)
  const exit = useExit()
  const { theme } = useTheme()

  const handleBranchSelect = (branch: string) => {
    if (state.type === "branch-select") {
      if (state.templates.length === 1) {
        setState({
          type: "editing",
          currentBranch: state.currentBranch,
          targetBranch: branch,
          template: state.templates[0]!,
        })
      } else {
        setState({
          type: "template-select",
          currentBranch: state.currentBranch,
          targetBranch: branch,
          templates: state.templates,
        })
      }
    }
  }

  const handleTemplateSelect = (template: Template) => {
    if (state.type === "template-select") {
      setState({
        type: "editing",
        currentBranch: state.currentBranch,
        targetBranch: state.targetBranch,
        template,
      })
    }
  }

  const handleSave = async (content: string) => {
    if (state.type === "editing") {
      setState({
        type: "creating",
        currentBranch: state.currentBranch,
        targetBranch: state.targetBranch,
      })

      const titleMatch = content.match(/^#\s*(.+)$/m)
      const title = titleMatch
        ? titleMatch[1]!.trim()
        : `PR from ${state.currentBranch || "current branch"}`

      const result = await createPR(state.targetBranch, title, content)

      if (result.success && result.url) {
        setState({ type: "success", url: result.url })
        setTimeout(() => {
          exit(0)
        }, 3000)
      } else {
        const compareUrl = await getCompareUrl()
        setState({
          type: "failed",
          error: result.error || "Failed to create PR",
          compareUrl,
        })
      }
    }
  }

  const handleCancel = () => {
    exit(0)
  }

  const handleErrorAction = async () => {
    if (state.type !== "error") return

    switch (state.reason) {
      case "gh-not-installed": {
        await $`open https://cli.github.com`.quiet().catch(() => { })
        exit(0)
        break
      }
      case "gh-not-authenticated": {
        await $`gh auth login`.quiet().catch(() => { })
        exit(0)
        break
      }
      case "no-templates": {
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
- [ ] Comments added for complex code
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

  if (state.type === "loading") {
    return <WelcomeScreen onQuit={handleCancel} />
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

  const currentBranch =
    state.type === "branch-select"
      ? state.currentBranch
      : state.type === "template-select"
        ? state.currentBranch
        : state.type === "editing"
          ? state.currentBranch
          : null

  const targetBranch =
    state.type === "template-select"
      ? state.targetBranch
      : state.type === "editing"
        ? state.targetBranch
        : null

  return (
    <box flexDirection="column" flexGrow={1} gap={1}>
      <Header currentBranch={currentBranch} targetBranch={targetBranch} />

      {state.type === "branch-select" && (
        <BranchPicker
          branches={state.branches}
          currentBranch={state.currentBranch}
          onSelect={handleBranchSelect}
          onCancel={handleCancel}
        />
      )}

      {state.type === "template-select" && (
        <TemplatePicker
          templates={state.templates}
          onSelect={handleTemplateSelect}
          onCancel={handleCancel}
        />
      )}

      {state.type === "editing" && (
        <Editor
          initialContent={state.template.content}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {state.type === "creating" && (
        <box
          alignItems="center"
          justifyContent="center"
          flexGrow={1}
          flexDirection="column"
          gap={1}
        >
          <text fg={theme.info}>Creating pull request...</text>
          <StatusBar status="creating" />
        </box>
      )}

    </box>
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
