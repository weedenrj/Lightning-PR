---
description: Create new slash command following command-development best practices with validation
argument-hint: [command-name] [description]
allowed-tools: Read, Write, CodebaseSearch, Grep
---

Create a new slash command following command-development best practices. Commands are reusable prompts that Claude executes when invoked, providing consistency and efficiency for common workflows.

**When to create a command:**
- A workflow is frequently repeated
- A complex prompt needs standardization
- Team members need consistent access to a workflow
- A task requires specific tool access or model configuration

## Argument Parsing

**Parse arguments:**
- Extract command name from `$1` (required)
- Extract description from `$2` or remaining `$ARGUMENTS` (optional)
- **Validate naming format:** Command name must follow `Category: Action description` format where Category is capitalized and action description follows proper English sentence capitalization (e.g., "Linear: Create lint rule")
- **Note:** This format is for Cursor. Claude Code files will use kebab-case conversion of this name

**If arguments missing:**
- Prompt user for command name and description
- Ask for concrete examples of how the command will be used
- Understand the workflow the command should execute

## Execution Process

### Step 1: Understand the Command

**If arguments provided:**
- Use command name and description from arguments
- Still validate understanding with user

**If arguments missing:**
- Prompt user for command name and description
- Ask for concrete examples of how the command will be used

**Questions to ask:**
- "What workflow should this command execute?"
- "What arguments should the command accept?"
- "What tools does the command need access to?"
- "Should this command be project-specific or personal?"

**Conclude when:**
- There is clear understanding of the command's purpose
- You know what arguments it should accept
- You understand the workflow it should execute
- You know required tools and model preferences

### Step 2: Plan the Command Structure

**Determine command location:**
- **Project command:** `.claude/commands/` and `.cursor/commands/` (shared with team)
- **Personal command:** `~/.claude/commands/` (available everywhere)

**Identify required components:**
- **YAML frontmatter:** description, allowed-tools, model, argument-hint
- **Command body:** Instructions FOR Claude (not messages to user)
- **Dynamic arguments:** `$1`, `$2`, `$ARGUMENTS` if needed
- **File references:** `@file-path` syntax if needed
- **Bash execution:** Backticks with `!` prefix if needed

**Command design principles:**
- Single responsibility: One command, one task
- Clear descriptions: Self-explanatory in `/help`
- Explicit dependencies: Use `allowed-tools` when needed
- Document arguments: Always provide `argument-hint`
- **Naming convention:** 
  - **Cursor:** Use `Category: Action description` format where Category is capitalized and action description follows proper English sentence capitalization (e.g., "Lightning PR: Check for errors")
  - **Claude Code:** If `.claude/commands/` exists in this repo, also create a kebab-case file (e.g., "Lightning PR: Check for errors" → `lightning-pr-check-for-errors.md`)

### Step 3: Create Command File

**Parity requirement (repo-dependent):**

- If `.claude/commands/` exists in this repo, keep commands in perfect parity between `.claude/commands/` and `.cursor/commands/`
- If `.claude/commands/` does not exist, create the command only in `.cursor/commands/`

**Create command in both locations with different file names:**
- **Claude Code (`.claude/commands/`):** Convert "Category: Action description" to kebab-case
  - Example: "Lightning PR: Code review" → `lightning-pr-code-review.md`
  - Conversion: lowercase, replace spaces and colons with hyphens
- **Cursor (`.cursor/commands/`):** Use "Category: Action description" format as provided
  - Example: `Lightning PR: Code review.md`
  - Format: Category capitalized, action description follows proper English sentence capitalization

**File naming conversion rules:**
- Parse "Category: Action description" from user input
- Claude Code filename: Convert to lowercase, replace spaces and colons with hyphens
- Cursor filename: Use as-is with proper capitalization
- Both files must have identical content, only file names differ

**CRITICAL:** File names are IDE-specific and must NEVER be changed when syncing. Only content should be synchronized.

**File structure:**
```
.claude/commands/
└── lightning-pr-code-review.md          ← Claude Code: kebab-case

.cursor/commands/
└── Lightning PR: Code review.md         ← Cursor: Category: Action description
```

### Step 4: Write the Command

#### YAML Frontmatter

**Required fields:**
```yaml
---
description: Brief description shown in /help (under 60 characters)
argument-hint: [arg1] [arg2] [optional-arg]
allowed-tools: Read, Write, Edit, Bash(git:*)
model: sonnet
---
```

**Field guidelines:**
- **description:** Clear, actionable description (under 60 characters)
- **argument-hint:** Document expected arguments for autocomplete
- **allowed-tools:** Specify which tools command can use (default: inherits from conversation)
- **model:** Specify model if needed (sonnet, opus, haiku) - default: inherits from conversation
- **disable-model-invocation:** Set to `true` if command should only be manually invoked

**Tool patterns:**
- `Read, Write, Edit` - Specific tools
- `Bash(git:*)` - Bash with git commands only
- `Bash(npm:*)` - Bash with npm commands only
- `*` - All tools (rarely needed)

**Tool Reference Format (MCP Tools):**
- When adding MCP tools to `allowed-tools`, use IDE-specific format:
  - Claude format: `mcp__figma__get_design_context` (double underscores: `mcp__server-name__tool_name`)
  - Cursor format: `mcp_user-Figma_get_design_context` (single underscore, different structure: `mcp_user-ServerName_tool_name`)
- Tool references in command body should use format appropriate to context
- **CRITICAL:** Tool references must remain IDE-specific when syncing - never change them

#### Command Body

**Critical: Commands are Instructions FOR Claude**

Write commands as directives TO Claude about what to do, not as messages TO the user.

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

**Command body structure:**
1. **Clear objective:** State what Claude should accomplish
2. **Step-by-step instructions:** Break down complex workflows
3. **Validation:** Check arguments, file existence, prerequisites
4. **Error handling:** Provide helpful messages for edge cases
5. **Output format:** Specify what Claude should report

**Dynamic arguments:**
- `$ARGUMENTS` - Capture all arguments as single string
- `$1`, `$2`, `$3` - Capture individual positional arguments
- Combine: `$1` for first arg, `$ARGUMENTS` for remaining

**File references:**
- `@$1` - Reference file from argument
- `@path/to/file` - Reference specific file
- Multiple: `@file1` and `@file2`

**Bash execution:**
- Use backticks with `!` prefix: `!`git status --porcelain`
- Limit scope: `Bash(git:*)` not `Bash(*)`
- Handle errors: Check command failures

**Argument validation pattern:**
```markdown
$IF($1,
  Process file: @$1,
  Please provide a file path. Usage: /command-name [file-path]
)
```

**File existence check pattern:**
```markdown
Check file exists: !`test -f $1 && echo "EXISTS" || echo "MISSING"`

If file exists:
  Process: @$1
Otherwise:
  Explain where to place file
  Show expected format
  Provide example
```

### Step 5: Validate and Test

**Validation checklist:**
1. **Check structure:** Command file exists in both `.claude/commands/` and `.cursor/commands/`
2. **Verify file names:** Claude Code uses kebab-case, Cursor uses "Category: Action description" format
3. **Verify parity:** Both locations have identical content (only names differ)
4. **Validate frontmatter:** Has required fields (description, argument-hint)
5. **Check writing style:** Body uses instructions FOR Claude, not messages TO user
6. **Verify arguments:** Argument handling matches `argument-hint`
7. **Check file references:** File paths are valid and relative to project
8. **Validate bash commands:** Bash commands are safe and scoped appropriately
9. **Test tool access:** `allowed-tools` includes required tools
10. **Verify model:** Model selection is appropriate for task complexity
11. **Verify tool references:** If `allowed-tools` frontmatter includes MCP tools, verify it uses IDE-specific format

**Report validation results:**
- List any issues found
- Confirm parity between both locations
- Verify all requirements met
- Suggest improvements if needed

### Step 6: Iterate

After creation, improve based on usage:
- Strengthen argument validation
- Add missing error handling
- Clarify ambiguous instructions
- Add edge case handling
- Optimize bash command execution

## Critical Requirements

**Dual Folder Parity:**
- Commands MUST be kept in perfect parity between `.claude/commands/` and `.cursor/commands/` folders
- Any change to one must be immediately applied to the other
- Both files must have exactly the same content (only file names differ)
- Claude Code uses kebab-case filenames, Cursor uses "Category: Action description" format
- Maintain identical directory structure in both folders

**Writing Style:**
- Frontmatter description: Brief, actionable (under 60 characters)
- Command body: Instructions FOR Claude (imperative, directive language)
- Never write messages TO the user in command body
- Use clear, step-by-step instructions

**Command Design:**
- Single responsibility: One command, one task
- Clear descriptions: Self-explanatory in `/help`
- Explicit dependencies: Use `allowed-tools` when needed
- Document arguments: Always provide `argument-hint`
- **Naming convention:** 
  - **Cursor:** Use `Category: Action description` format where Category is capitalized and action description follows proper English sentence capitalization (e.g., "Lightning PR: Check for errors")
  - **Claude Code:** If `.claude/commands/` exists in this repo, also create a kebab-case file (e.g., "Lightning PR: Check for errors" → `lightning-pr-check-for-errors.md`)

**Argument Handling:**
- Validate arguments early in command
- Provide helpful error messages
- Suggest corrective actions
- Handle edge cases gracefully

**File References:**
- Use explicit paths
- Check existence when needed
- Use project-relative paths
- Handle missing files gracefully

**Bash Commands:**
- Limit scope: Use `Bash(git:*)` not `Bash(*)`
- Safe commands: Avoid destructive operations
- Handle errors: Consider command failures
- Keep fast: Long-running commands slow invocation

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

### Validation Pattern
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

## Quality Checklist

- [ ] Command exists in both `.claude/commands/` and `.cursor/commands/` directories
- [ ] Both locations have identical content
- [ ] Command has valid YAML frontmatter with `description` and `argument-hint`
- [ ] Description is clear and actionable (under 60 characters)
- [ ] Command body uses instructions FOR Claude, not messages TO user
- [ ] Arguments are validated and handled gracefully
- [ ] File references use valid paths
- [ ] Bash commands are safe and scoped appropriately
- [ ] `allowed-tools` includes required tools
- [ ] Model selection is appropriate for task complexity
- [ ] Error handling provides helpful messages
- [ ] Command follows naming conventions: Claude Code uses kebab-case, Cursor uses "Category: Action description" format
