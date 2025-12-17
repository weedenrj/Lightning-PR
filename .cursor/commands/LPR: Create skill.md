---
description: Create new skill following skill-development process with discovery and planning
argument-hint: [skill-name] [description]
allowed-tools: Read, Write, CodebaseSearch, Grep
---

Create a new skill following the skill-development process. Skills are modular, self-contained packages that extend Claude's capabilities with specialized knowledge, workflows, and tools.

**When to create a skill:**
- A pattern is likely to be repeated across the codebase
- There are non-obvious integration points or gotchas
- Documentation would save significant time for future implementations
- A workflow requires specialized procedural knowledge

## Argument Parsing

**Parse arguments:**
- Extract skill name from `$1` (required)
- Extract description from `$2` or remaining `$ARGUMENTS` (optional)
- Normalize skill name: kebab-case, no spaces

**If arguments missing:**
- Prompt user for skill name and description
- Ask for concrete examples of how the skill will be used

## Execution Process

Follow the skill-development process in order. Reference the skill-development skill for complete methodology.

### Step 1: Understand the Skill with Concrete Examples

**If arguments provided:**
- Use skill name and description from arguments
- Still ask for concrete examples to validate understanding

**If arguments missing:**
- Prompt user for skill name and description
- Ask for concrete examples of how the skill will be used

**Questions to ask:**
- "What functionality should this skill support?"
- "Can you give some examples of how this skill would be used?"
- "What would a user say that should trigger this skill?"

**Conclude when:**
- There is a clear sense of the functionality the skill should support
- You understand concrete usage patterns
- You know what would trigger the skill

### Step 2: Plan the Reusable Skill Contents

Analyze each example to identify reusable resources:
- **Scripts** (`scripts/`) - Executable code that's repeatedly rewritten
- **References** (`references/`) - Documentation loaded as needed (schemas, API docs, detailed patterns)
- **Assets** (`assets/`) - Files used in output (templates, icons, boilerplate)
- **Examples** (`examples/`) - Working code examples users can copy

Create a list of reusable resources to include.

### Step 3: Create Skill Structure

**Create skill directories:**
- Create `.cursor/skills/skill-name/SKILL.md`
- Use skill name from arguments or user input (kebab-case)

**Parity requirement (repo-dependent):**

- If `.claude/skills/` exists in this repo, keep skills in perfect parity between `.claude/skills/` and `.cursor/skills/`
- If `.claude/skills/` does not exist, create the skill only in `.cursor/skills/`

**Optional directories:** Only create `references/`, `examples/`, `scripts/`, and `assets/` directories when needed (when moving content out of SKILL.md to keep it lean). Create them in both locations only when you have content to put in them.

### Step 4: Edit the Skill

#### Start with Reusable Resources

If you identified reusable resources in Step 2, create the necessary directories and files: `scripts/`, `references/`, `examples/`, and `assets/`. This may require user input (e.g., brand assets, API documentation).

**Note:** Only create directories and files you actually need. If SKILL.md stays lean without needing these resources, skip this step.

#### Update SKILL.md

**YAML Frontmatter (required):**
```yaml
---
name: Skill Name
description: This skill should be used when the user asks to "specific phrase 1", "specific phrase 2", "specific phrase 3". Include exact phrases users would say that should trigger this skill. Be concrete and specific.
version: 0.1.0
---
```

**Description Requirements:**
- Use third-person format: "This skill should be used when..."
- Include specific trigger phrases users would say
- Be concrete and specific, not vague

**SKILL.md Body:**
- Write in **imperative/infinitive form** (verb-first instructions), not second person
- Use objective, instructional language (e.g., "To accomplish X, do Y" rather than "You should do X")
- Target 1,500-2,000 words (ideally), maximum 3,000 words
- Keep it lean - move detailed content to `references/`
- Answer: What is the purpose? When should it be used? How should Claude use it?
- Reference all reusable resources so Claude knows how to use them

**Reference Resources in SKILL.md:**
```markdown
## Additional Resources

### Reference Files
- **`references/patterns.md`** - Detailed patterns
- **`references/advanced.md`** - Advanced techniques

### Examples
- **`examples/example-script.sh`** - Working example

### Scripts
- **`scripts/validate.sh`** - Validation utility
```

**Tool Reference Format:**
- When adding `allowed-tools` to frontmatter, use IDE-specific format:
  - Claude: `mcp__figma__get_design_context` (double underscores)
  - Cursor: `mcp_user-Figma_get_design_context` (single underscore, different structure)
- Tool references in skill body should use format appropriate to context

### Step 5: Validate and Test

**Validation checklist:**
1. **Check structure**: Skill directory exists in `.cursor/skills/skill-name/` (and `.claude/skills/skill-name/` if present)
2. **Verify parity**: If both locations exist, content and structure match exactly
3. **Validate SKILL.md**: Has frontmatter with name and description in both locations
4. **Check trigger phrases**: Description includes specific user queries (third-person format)
5. **Verify writing style**: Body uses imperative/infinitive form, not second person
6. **Test progressive disclosure**: SKILL.md is lean (1,500-2,000 words ideal), detailed content in references/
7. **Check references**: All referenced files exist in both locations
8. **Validate examples**: Examples are complete and correct
9. **Test scripts**: Scripts are executable and work correctly (if created)
10. **Verify tool references**: If `allowed-tools` frontmatter exists, verify it uses IDE-specific format (Claude vs Cursor)

**Report validation results:**
- List any issues found
- Confirm parity between both locations
- Verify all requirements met

### Step 6: Iterate

After testing, improve based on usage:
- Strengthen trigger phrases in description
- Move long sections from SKILL.md to references/
- Add missing examples or scripts
- Clarify ambiguous instructions
- Add edge case handling

## Critical Requirements

**Dual Folder Parity (repo-dependent):**
- If `.claude/skills/` exists, keep skills in perfect parity between `.claude/skills/` and `.cursor/skills/`
- If `.claude/skills/` does not exist, keep skills only in `.cursor/skills/`

**Writing Style:**
- Frontmatter description: Third person ("This skill should be used when...")
- SKILL.md body: Imperative/infinitive form (verb-first instructions)
- Never use second person ("You should...")

**Progressive Disclosure:**
- Core concepts in SKILL.md (1,500-2,000 words ideal)
- Detailed docs in references/
- Working code in examples/
- Utilities in scripts/
- Templates/assets in assets/

## Quality Checklist

- [ ] Skill exists in `.cursor/skills/` (and `.claude/skills/` if present)
- [ ] If both locations exist, content and structure match exactly
- [ ] SKILL.md has valid YAML frontmatter with `name` and `description`
- [ ] Description uses third person with specific trigger phrases
- [ ] SKILL.md body uses imperative/infinitive form
- [ ] SKILL.md is lean (1,500-2,000 words ideal, <3,000 max)
- [ ] Detailed content moved to references/
- [ ] All referenced files exist in the expected location(s)
- [ ] Examples are complete and working
- [ ] Scripts are executable and documented
