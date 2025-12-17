export type ErrorReason =
  | "not-git-repo"
  | "gh-not-installed"
  | "gh-not-authenticated"
  | "no-templates"
  | "no-branches"

type ErrorContent = {
  title: string
  message: string
  hasAction: boolean
  actionLabel?: string
}

export const getErrorContent = (reason: ErrorReason): ErrorContent => {
  switch (reason) {
    case "not-git-repo":
      return {
        title: "Not a Git Repository",
        message: "Navigate to a git repository and try again.",
        hasAction: false,
      }
    case "gh-not-installed":
      return {
        title: "GitHub CLI Not Installed",
        message: "Install gh CLI to continue.",
        hasAction: true,
        actionLabel: "open install page",
      }
    case "gh-not-authenticated":
      return {
        title: "GitHub CLI Not Authenticated",
        message: "Run 'gh auth login' to authenticate.",
        hasAction: true,
        actionLabel: "run auth",
      }
    case "no-templates":
      return {
        title: "No PR Templates Found",
        message: "No templates found in this repository.",
        hasAction: true,
        actionLabel: "create template",
      }
    case "no-branches":
      return {
        title: "No Remote Branches",
        message: "Push your branch and configure remote.",
        hasAction: false,
      }
  }
}
