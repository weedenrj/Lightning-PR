# templatr

A terminal UI application for creating GitHub pull requests from templates. Streamline your PR workflow with a simple, interactive interface.

## Installation

Install globally using Bun:

```bash
bun add -g github:yourusername/templatr
```

Replace `yourusername` with the GitHub username or organization that hosts the repository.

## Requirements

- [Bun](https://bun.sh) - Required to run the application
- [GitHub CLI](https://cli.github.com) - Required for creating pull requests

## Usage

Navigate to any git repository and run:

```bash
template
```

The application will:

1. Scan for PR templates in `.github/PULL_REQUEST_TEMPLATE/` or `.github/PULL_REQUEST_TEMPLATE.md`
2. Display available remote branches for selection (prioritizing `develop`, then `main`/`master`)
3. Show a list of available templates (if multiple exist)
4. Open an editor with the selected template pre-filled
5. Create the PR when you press `Cmd+S` (or `Ctrl+S` on Linux/Windows)

## Features

- **Smart branch selection**: Automatically prioritizes `develop`, then `main`/`master`
- **Template discovery**: Finds templates in standard GitHub locations
- **Built-in editor**: Edit your PR description directly in the terminal
- **GitHub integration**: Uses GitHub CLI to create pull requests
- **Graceful error handling**: Provides helpful fallback links when templates aren't found

## Keyboard Shortcuts

- `↑/↓` or `j/k` - Navigate lists
- `Enter` - Select option
- `Cmd+S` / `Ctrl+S` - Save and create PR
- `Escape` - Cancel and exit

## Documentation

This project uses [OpenTUI React](https://github.com/sst/opentui/tree/main/packages/react) for the terminal UI components. For more information about the UI framework, see the [OpenTUI React documentation](https://github.com/sst/opentui/tree/main/packages/react).

## Error Handling

If no templates are found, the application will display a link to create a PR manually via GitHub's web interface.
