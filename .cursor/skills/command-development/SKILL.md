---
name: Command Development
description: This skill should be used when the user asks to "create a slash command", "add a command", "write a custom command", "define command arguments", "use command frontmatter", "organize commands", "create command with file references", "interactive command", "use AskUserQuestion in command", or needs guidance on slash command structure, YAML frontmatter fields, dynamic arguments, bash execution in commands, user interaction patterns, or command development best practices for Claude Code.
version: 0.3.0
---

# Command Development for Claude Code

## Overview

Slash commands are frequently-used prompts defined as Markdown files that Claude executes during interactive sessions. Understanding command structure, frontmatter options, and dynamic features enables creating powerful, reusable workflows.

**Key concepts:**
- Markdown file format for commands
- YAML frontmatter for configuration
- Dynamic arguments and file references
- Bash execution for context
- Command organization and namespacing

## Command Basics

### What is a Slash Command?

A slash command is a Markdown file containing a prompt that Claude executes when invoked. Commands provide:
- **Reusability**: Define once, use repeatedly
- **Consistency**: Standardize common workflows
- **Sharing**: Distribute across team or projects
- **Efficiency**: Quick access to complex prompts

### Critical: Commands are Instructions FOR Claude

**Commands are written for agent consumption, not human consumption.**

When a user invokes `/command-name`, the command content becomes Claude's instructions. Write commands as directives TO Claude about what to do, not as messages TO the user.

**Correct approach (instructions for Claude):**
```markdown
Review this code for security vulnerabilities including:
- SQL injection
- XSS attacks
- Authentication issues

Provide specific line numbers and severity ratings.
```

**Incorrect approach (messages to user):**
```markdown
This command will review your code for security issues.
You'll receive a report with vulnerability details.
```

The first example tells Claude what to do. The second tells the user what will happen but doesn't instruct Claude. Always use the first approach.

### Command Locations

**Project commands** (shared with team):
- Location: `.claude/commands/`
- Scope: Available in specific project
- Label: Shown as "(project)" in `/help`
- Use for: Team workflows, project-specific tasks

**Personal commands** (available everywhere):
- Location: `~/.claude/commands/`
- Scope: Available in all projects
- Label: Shown as "(user)" in `/help`
- Use for: Personal workflows, cross-project utilities

### Critical: Dual Folder Parity Requirement

**Commands MUST be kept in perfect parity between `.claude/commands/` and `.cursor/commands/` folders.**

When creating or modifying any command:
1. **Always create/update in both locations**: `.claude/commands/` AND `.cursor/commands/`
2. **Identical content**: Both files must have exactly the same content
3. **Different file naming**: File names follow different conventions (see File Naming below)
4. **Same file structure**: Maintain identical directory structure in both folders
5. **Synchronize immediately**: Any change to one must be immediately applied to the other

**Why this matters:**
- Both Claude Code and Cursor read from their respective folders
- Maintaining parity ensures consistent behavior across both IDEs
- Prevents confusion and command availability issues

### File Naming Conventions

**CRITICAL:** File names differ between Claude Code and Cursor, but content must be identical. This difference exists because each IDE has different requirements for command file naming. When syncing, NEVER rename files - file names are IDE-specific and must be preserved.

**For Claude Code** (`.claude/commands/`):
- Use kebab-case: `category-action-description.md` or `action-description.md`
- Category prefix is optional (some commands include it, others don't)
- Examples:
  - `linear-debug-issue.md` (with category prefix)
  - `figma-fetch-design.md` (with category prefix)
  - `check-for-errors.md` (without category prefix)
  - `code-review.md` (without category prefix)
  - `create-command.md` (without category prefix)

**For Cursor** (`.cursor/commands/`):
- Use title case with colon: `Category: Action description.md`
- Category prefix is REQUIRED for all commands
- Examples:
  - `LPR: Code review.md`
  - `LPR: Create command.md`

**Example:**
```
.claude/commands/
└── linear-debug-issue.md          ← kebab-case for Claude (category prefix optional)

.cursor/commands/
└── Linear: Debug issue.md          ← Title case with colon for Cursor (category required)
```

## File Format

### Basic Structure

Commands are Markdown files with `.md` extension:

**Claude Code format:**
```
.claude/commands/
├── code-review.md           # /code-review command
├── linear-debug-issue.md    # /linear-debug-issue command (with category)
└── check-for-errors.md      # /check-for-errors command (without category)
```

**Cursor format:**
```
.cursor/commands/
├── LPR: Code review.md    # /LPR: Code review command
├── Linear: Debug issue.md   # /Linear: Debug issue command
```

**Simple command:**
```markdown
Review this code for security vulnerabilities including:
- SQL injection
- XSS attacks
- Authentication bypass
- Insecure data handling
```

No frontmatter needed for basic commands.

### With YAML Frontmatter

Add configuration using YAML frontmatter:

```markdown
---
description: Review code for security issues
allowed-tools: Read, Grep, Bash(git:*)
model: sonnet
---

Review this code for security vulnerabilities...
```

## YAML Frontmatter Fields

### description

**Purpose:** Brief description shown in `/help`
**Type:** String
**Default:** First line of command prompt

```yaml
---
description: Review pull request for code quality
---
```

**Best practice:** Clear, actionable description (under 60 characters)

### allowed-tools

**Purpose:** Specify which tools command can use
**Type:** String or Array
**Default:** Inherits from conversation

```yaml
---
allowed-tools: Read, Write, Edit, Bash(git:*)
---
```

**Patterns:**
- `Read, Write, Edit` - Specific tools
- `Bash(git:*)` - Bash with git commands only
- `*` - All tools (rarely needed)

**Use when:** Command requires specific tool access

### model

**Purpose:** Specify model for command execution
**Type:** String (sonnet, opus, haiku)
**Default:** Inherits from conversation

```yaml
---
model: haiku
---
```

**Use cases:**
- `haiku` - Fast, simple commands
- `sonnet` - Standard workflows
- `opus` - Complex analysis

### argument-hint

**Purpose:** Document expected arguments for autocomplete
**Type:** String
**Default:** None

```yaml
---
argument-hint: [pr-number] [priority] [assignee]
---
```

**Benefits:**
- Helps users understand command arguments
- Improves command discovery
- Documents command interface

### disable-model-invocation

**Purpose:** Prevent SlashCommand tool from programmatically calling command
**Type:** Boolean
**Default:** false

```yaml
---
disable-model-invocation: true
---
```

**Use when:** Command should only be manually invoked

## Dynamic Arguments

### Using $ARGUMENTS

Capture all arguments as single string:

```markdown
---
description: Fix issue by number
argument-hint: [issue-number]
---

Fix issue #$ARGUMENTS following our coding standards and best practices.
```

**Usage:**
```
> /fix-issue 123
> /fix-issue 456
```

**Expands to:**
```
Fix issue #123 following our coding standards...
Fix issue #456 following our coding standards...
```

### Using Positional Arguments

Capture individual arguments with `$1`, `$2`, `$3`, etc.:

```markdown
---
description: Review PR with priority and assignee
argument-hint: [pr-number] [priority] [assignee]
---

Review pull request #$1 with priority level $2.
After review, assign to $3 for follow-up.
```

**Usage:**
```
> /review-pr 123 high alice
```

**Expands to:**
```
Review pull request #123 with priority level high.
After review, assign to alice for follow-up.
```

### Combining Arguments

Mix positional and remaining arguments:

```markdown
Deploy $1 to $2 environment with options: $3
```

**Usage:**
```
> /deploy api staging --force --skip-tests
```

**Expands to:**
```
Deploy api to staging environment with options: --force --skip-tests
```

## File References

### Using @ Syntax

Include file contents in command:

```markdown
---
description: Review specific file
argument-hint: [file-path]
---

Review @$1 for:
- Code quality
- Best practices
- Potential bugs
```

**Usage:**
```
> /review-file src/api/users.ts
```

**Effect:** Claude reads `src/api/users.ts` before processing command

### Multiple File References

Reference multiple files:

```markdown
Compare @src/old-version.js with @src/new-version.js

Identify:
- Breaking changes
- New features
- Bug fixes
```

### Static File References

Reference known files without arguments:

```markdown
Review @package.json and @tsconfig.json for consistency

Ensure:
- TypeScript version matches
- Dependencies are aligned
- Build configuration is correct
```

## Bash Execution in Commands

Commands can execute bash commands inline to dynamically gather context before Claude processes the command. This is useful for including repository state, environment information, or project-specific context.

**When to use:**
- Include dynamic context (git status, environment vars, etc.)
- Gather project/repository state
- Build context-aware workflows

**Implementation details:**
Commands can execute bash commands using backticks with `!` prefix. The bash command output is included in the command context before Claude processes the command.

## Command Organization

### Flat Structure

Simple organization for small command sets:

```
.claude/commands/
├── build.md
├── test.md
├── deploy.md
├── review.md
└── docs.md
```

**Use when:** 5-15 commands, no clear categories

### Namespaced Structure

Organize commands in subdirectories:

```
.claude/commands/
├── ci/
│   ├── build.md        # /build (project:ci)
│   ├── test.md         # /test (project:ci)
│   └── lint.md         # /lint (project:ci)
├── git/
│   ├── commit.md       # /commit (project:git)
│   └── pr.md           # /pr (project:git)
└── docs/
    ├── generate.md     # /generate (project:docs)
    └── publish.md       # /publish (project:docs)
```

**Benefits:**
- Logical grouping by category
- Namespace shown in `/help`
- Easier to find related commands

**Use when:** 15+ commands, clear categories

## Best Practices

### Command Synchronization

**CRITICAL WARNINGS:**
- **Never change tool references when syncing** - Tool names in `allowed-tools` frontmatter are IDE-specific
- **Never rename files when syncing** - File names are IDE-specific and must match each IDE's requirements

**CRITICAL:** Always maintain parity between `.claude/commands/` and `.cursor/commands/`:
1. **Create in both locations:** New commands must exist in both folders
2. **Use correct file naming:** 
   - Claude Code: kebab-case (category prefix optional, e.g., `check-for-errors.md` or `linear-debug-issue.md`)
   - Cursor: Title case with colon, category required (e.g., `LPR: Check for errors.md` or `Linear: Debug issue.md`)
3. **Update both files:** Any modification requires updating both files identically
4. **Verify content matches:** Ensure byte-for-byte identical content (file names differ)
5. **Check structure:** Maintain same directory structure in both folders
6. **Test in both IDEs:** Verify command works in both Claude Code and Cursor

**CRITICAL EXCEPTION: MCP Tool Naming**

Claude and Cursor use different MCP tool naming formats. When working with MCP tools in commands:

- **Claude format**: `mcp__figma__get_design_context` (double underscores: `mcp__server-name__tool_name`)
- **Cursor format**: `mcp_user-Figma_get_design_context` (single underscore, different structure: `mcp_user-ServerName_tool_name`)

**When syncing commands with MCP tools:**
- Update the `allowed-tools` frontmatter field in each location with the correct format for that IDE
- Keep all other content identical between both locations
- Tool references in the command body should use the format appropriate to the context (Claude vs Cursor)

**Note:** When creating commands that work with skills (e.g., listing skills, creating skills), ensure the skills table of contents in `.cursor/rules/skills.mdc` is maintained. See the Skill Development skill for details on maintaining the skills index.

### Syncing Protocol for Dual IDE Support

**CRITICAL:** When syncing commands between `.claude/commands/` and `.cursor/commands/`, follow this protocol:

1. **General Content Sync:**
   - Update command body content identically in both locations
   - Maintain identical YAML frontmatter (except tool references and file names)
   - Preserve all functionality and instructions

2. **File Naming Preservation:**
   - **NEVER rename files** when syncing - file names are IDE-specific
   - Claude Code: kebab-case (e.g., `linear-debug-issue.md`)
   - Cursor: "Category: Action description" (e.g., `Linear: Debug issue.md`)
   - File names must match each IDE's requirements

3. **Tool Reference Preservation:**
   - **NEVER change tool references** when syncing - they are IDE-specific
   - Claude format: `mcp__figma__get_design_context` (double underscores: `mcp__server-name__tool_name`)
   - Cursor format: `mcp_user-Figma_get_design_context` (single underscore, different structure: `mcp_user-ServerName_tool_name`)
   - When syncing, identify `allowed-tools` frontmatter field and preserve IDE-specific format

4. **Sync Workflow:**
   - Make content changes to one location
   - Copy content changes to other location (preserving file name)
   - Verify tool references remain IDE-specific in each location
   - Verify file names match IDE conventions
   - Test that both commands work in their respective IDEs

**Why this matters:**
- General content updates (command body, instructions) should be synchronized
- File names must remain IDE-specific for commands to be discoverable
- Tool references must remain IDE-specific for tools to function correctly
- Following this protocol ensures commands work in both IDEs without breaking functionality

### Command Design

1. **Single responsibility:** One command, one task
2. **Clear descriptions:** Self-explanatory in `/help`
3. **Explicit dependencies:** Use `allowed-tools` when needed
4. **Document arguments:** Always provide `argument-hint`
5. **Consistent naming:** Use verb-noun pattern (review-pr, fix-issue)

### Command Naming Convention

**CRITICAL:** This naming convention applies to Cursor commands (`.cursor/commands/`). All Cursor commands must follow the exact naming format:

**Format:** `Category: Action description`

**Capitalization rules:**
- **Category:** First word capitalized (e.g., "Linear", "LPR", "Figma")
- **After colon:** First word capitalized, rest follows proper English sentence capitalization

**Examples:**
- ✅ `Linear: Create lint rule` (correct)
- ✅ `LPR: Check for errors` (correct)
- ✅ `Figma: Fetch design` (correct)
- ❌ `Linear: Create Lint Rule` (incorrect - too many capitals)
- ❌ `LPR: Check For Errors` (incorrect - "For" should be lowercase)
- ❌ `linear: create lint rule` (incorrect - category must be capitalized)
- ❌ `Check for errors` (incorrect - category prefix required in Cursor)

**Pattern:**
- Category name: Capitalize first letter only
- Action description: Capitalize first word, lowercase the rest (unless proper nouns)
- Follow standard English sentence capitalization rules after the colon
- **Category prefix is required** for all Cursor commands

**Note:** Claude Code commands (`.claude/commands/`) use kebab-case and category prefixes are optional. See "File Naming Conventions" section above for details.

### Argument Handling

1. **Validate arguments:** Check for required arguments in prompt
2. **Provide defaults:** Suggest defaults when arguments missing
3. **Document format:** Explain expected argument format
4. **Handle edge cases:** Consider missing or invalid arguments

```markdown
---
argument-hint: [pr-number]
---

$IF($1,
  Review PR #$1,
  Please provide a PR number. Usage: /review-pr [number]
)
```

### File References

1. **Explicit paths:** Use clear file paths
2. **Check existence:** Handle missing files gracefully
3. **Relative paths:** Use project-relative paths
4. **Glob support:** Consider using Glob tool for patterns

### Bash Commands

1. **Limit scope:** Use `Bash(git:*)` not `Bash(*)`
2. **Safe commands:** Avoid destructive operations
3. **Handle errors:** Consider command failures
4. **Keep fast:** Long-running commands slow invocation

### Documentation

1. **Add comments:** Explain complex logic
2. **Provide examples:** Show usage in comments
3. **List requirements:** Document dependencies
4. **Version commands:** Note breaking changes

```markdown
---
description: Deploy application to environment
argument-hint: [environment] [version]
---

<!--
Usage: /deploy [staging|production] [version]
Requires: AWS credentials configured
Example: /deploy staging v1.2.3
-->

Deploy application to $1 environment using version $2...
```

## Common Patterns

### Review Pattern

```markdown
---
description: Review code changes
allowed-tools: Read, Bash(git:*)
---

Files changed: !`git diff --name-only`

Review each file for:
1. Code quality and style
2. Potential bugs or issues
3. Test coverage
4. Documentation needs

Provide specific feedback for each file.
```

### Testing Pattern

```markdown
---
description: Run tests for specific file
argument-hint: [test-file]
allowed-tools: Bash(npm:*)
---

Run tests: !`npm test $1`

Analyze results and suggest fixes for failures.
```

### Documentation Pattern

```markdown
---
description: Generate documentation for file
argument-hint: [source-file]
---

Generate comprehensive documentation for @$1 including:
- Function/class descriptions
- Parameter documentation
- Return value descriptions
- Usage examples
- Edge cases and errors
```

### Workflow Pattern

```markdown
---
description: Complete PR workflow
argument-hint: [pr-number]
allowed-tools: Bash(gh:*), Read
---

PR #$1 Workflow:

1. Fetch PR: !`gh pr view $1`
2. Review changes
3. Run checks
4. Approve or request changes
```

## Troubleshooting

**Command not appearing:**
- Check file is in correct directory
- Verify `.md` extension present
- Ensure valid Markdown format
- Restart Claude Code

**Arguments not working:**
- Verify `$1`, `$2` syntax correct
- Check `argument-hint` matches usage
- Ensure no extra spaces

**Bash execution failing:**
- Check `allowed-tools` includes Bash
- Verify command syntax in backticks
- Test command in terminal first
- Check for required permissions

**File references not working:**
- Verify `@` syntax correct
- Check file path is valid
- Ensure Read tool allowed
- Use absolute or project-relative paths

## Validation Patterns

Commands should validate inputs and resources before processing.

### Argument Validation

```markdown
---
description: Deploy with validation
argument-hint: [environment]
---

Validate environment: !`echo "$1" | grep -E "^(dev|staging|prod)$" || echo "INVALID"`

If $1 is valid environment:
  Deploy to $1
Otherwise:
  Explain valid environments: dev, staging, prod
  Show usage: /deploy [environment]
```

### File Existence Checks

```markdown
---
description: Process configuration
argument-hint: [config-file]
---

Check file exists: !`test -f $1 && echo "EXISTS" || echo "MISSING"`

If file exists:
  Process configuration: @$1
Otherwise:
  Explain where to place config file
  Show expected format
  Provide example configuration
```

### Error Handling

```markdown
---
description: Build with error handling
allowed-tools: Bash(*)
---

Execute build: !`npm run build 2>&1 || echo "BUILD_FAILED"`

If build succeeded:
  Report success and output location
If build failed:
  Analyze error output
  Suggest likely causes
  Provide troubleshooting steps
```

**Best practices:**
- Validate early in command
- Provide helpful error messages
- Suggest corrective actions
- Handle edge cases gracefully

---

For detailed frontmatter field specifications, see `references/frontmatter-reference.md`.
For command pattern examples, see `examples/` directory.
