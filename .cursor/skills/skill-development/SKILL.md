---
name: Skill Development
description: This skill should be used when the user wants to "create a skill", "write a new skill", "improve skill description", "organize skill content", or needs guidance on skill structure, progressive disclosure, or skill development best practices.
version: 0.1.0
---

# Skill Development

This skill provides guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing
specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific
domains or tasks—they transform Claude from a general-purpose agent into a specialized agent
equipped with procedural knowledge that no model can fully possess.

### What Skills Provide

1. Specialized workflows - Multi-step procedures for specific domains
2. Tool integrations - Instructions for working with specific file formats or APIs
3. Domain expertise - Company-specific knowledge, schemas, business logic
4. Bundled resources - Scripts, references, and assets for complex and repetitive tasks

### Anatomy of a Skill

Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation intended to be loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

#### SKILL.md (required)

**Metadata Quality:** The `name` and `description` in YAML frontmatter determine when Claude will use the skill. Be specific about what the skill does and when to use it. Use the third-person (e.g. "This skill should be used when..." instead of "Use this skill when...").

#### Bundled Resources (optional)

##### Scripts (`scripts/`)

Executable code (Python/Bash/etc.) for tasks that require deterministic reliability or are repeatedly rewritten.

- **When to include**: When the same code is being rewritten repeatedly or deterministic reliability is needed
- **Example**: `scripts/rotate_pdf.py` for PDF rotation tasks
- **Benefits**: Token efficient, deterministic, may be executed without loading into context
- **Note**: Scripts may still need to be read by Claude for patching or environment-specific adjustments

##### References (`references/`)

Documentation and reference material intended to be loaded as needed into context to inform Claude's process and thinking.

- **When to include**: For documentation that Claude should reference while working
- **Examples**: `references/finance.md` for financial schemas, `references/mnda.md` for company NDA template, `references/policies.md` for company policies, `references/api_docs.md` for API specifications
- **Use cases**: Database schemas, API documentation, domain knowledge, company policies, detailed workflow guides
- **Benefits**: Keeps SKILL.md lean, loaded only when Claude determines it's needed
- **Best practice**: If files are large (>10k words), include grep search patterns in SKILL.md
- **Avoid duplication**: Information should live in either SKILL.md or references files, not both. Prefer references files for detailed information unless it's truly core to the skill—this keeps SKILL.md lean while making information discoverable without hogging the context window. Keep only essential procedural instructions and workflow guidance in SKILL.md; move detailed reference material, schemas, and examples to references files.

##### Assets (`assets/`)

Files not intended to be loaded into context, but rather used within the output Claude produces.

- **When to include**: When the skill needs files that will be used in the final output
- **Examples**: `assets/logo.png` for brand assets, `assets/slides.pptx` for PowerPoint templates, `assets/frontend-template/` for HTML/React boilerplate, `assets/font.ttf` for typography
- **Use cases**: Templates, images, icons, boilerplate code, fonts, sample documents that get copied or modified
- **Benefits**: Separates output resources from documentation, enables Claude to use files without loading them into context

### Progressive Disclosure Design Principle

Skills use a three-level loading system to manage context efficiently:

1. **Metadata (name + description)** - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words)
3. **Bundled resources** - As needed by Claude (Unlimited*)

*Unlimited because scripts can be executed without reading into context window.

## Skill Creation Process

To create a skill, follow the "Skill Creation Process" in order, skipping steps only if there is a clear reason why they are not applicable.

### Step 1: Understanding the Skill with Concrete Examples

Skip this step only when the skill's usage patterns are already clearly understood. It remains valuable even when working with an existing skill.

To create an effective skill, clearly understand concrete examples of how the skill will be used. This understanding can come from either direct user examples or generated examples that are validated with user feedback.

For example, when building an image-editor skill, relevant questions include:

- "What functionality should the image-editor skill support? Editing, rotating, anything else?"
- "Can you give some examples of how this skill would be used?"
- "I can imagine users asking for things like 'Remove the red-eye from this image' or 'Rotate this image'. Are there other ways you imagine this skill being used?"
- "What would a user say that should trigger this skill?"

To avoid overwhelming users, avoid asking too many questions in a single message. Start with the most important questions and follow up as needed for better effectiveness.

Conclude this step when there is a clear sense of the functionality the skill should support.

### Step 2: Planning the Reusable Skill Contents

To turn concrete examples into an effective skill, analyze each example by:

1. Considering how to execute on the example from scratch
2. Identifying what scripts, references, examples, and assets would be helpful when executing these workflows repeatedly

Example: When building a `building-csv-imports` skill to handle queries like "build CSV import", "create CSV import functionality", or "import contacts from CSV," the analysis shows:

1. CSV imports require mapping external platform formats to LPR data models using header matching patterns
2. The same header matching logic, data transformation patterns, and validation flows are repeated across different CSV import implementations
3. An `examples/ContactCSVImport.tsx` file showing the complete implementation would be helpful
4. An `examples/actions.ts` file showing server-side batch operations would be helpful
5. A `references/header-matching-patterns.md` file documenting advanced header matching scenarios (combining/splitting fields) would help avoid bloating SKILL.md

Example: When building a `building-paginated-routes-api` skill to handle queries like "create paginated endpoint" or "add cursor-based pagination," the analysis shows:

1. Paginated API routes follow the same cursor-based pattern with MongoDB queries
2. The same cursor generation, query building, and response formatting logic is repeated
3. An `examples/paginated-route.ts` file showing the complete pattern would be helpful
4. A `references/advanced-pagination.md` file documenting edge cases and filtering patterns would help keep SKILL.md lean

Example: When building a skill that requires validation utilities, the analysis shows:
1. Developers repeatedly need to validate schemas and test implementations
2. `scripts/validate-schema.sh` and `scripts/test-implementation.sh` utilities would be helpful
3. `references/patterns.md` for detailed patterns to avoid bloating SKILL.md

To establish the skill's contents, analyze each concrete example to create a list of the reusable resources to include: scripts, references, examples, and assets.

### Step 3: Create Skill Structure

Create the skill directory structure in both locations:

```bash
touch .claude/skills/skill-name/SKILL.md
touch .cursor/skills/skill-name/SKILL.md
```

**Critical:** Always create the skill structure in both `.claude/skills/` and `.cursor/skills/` directories to maintain parity.

**Optional directories:** Only create `references/`, `examples/`, `scripts/`, and `assets/` directories when needed (when moving content out of SKILL.md to keep it lean). Create them in both locations:

```bash
# Only create these when you have content to put in them
mkdir -p .claude/skills/skill-name/{references,examples,scripts,assets}
mkdir -p .cursor/skills/skill-name/{references,examples,scripts,assets}
```

### Step 4: Edit the Skill

When editing the (newly-created or existing) skill, remember that the skill is being created for another instance of Claude to use. Focus on including information that would be beneficial and non-obvious to Claude. Consider what procedural knowledge, domain-specific details, or reusable assets would help another Claude instance execute these tasks more effectively.

#### Start with Reusable Skill Contents

If you identified reusable resources in Step 2, create the necessary directories and files: `scripts/`, `references/`, `examples/`, and `assets/`. Note that this step may require user input. For example, when implementing a `brand-guidelines` skill, the user may need to provide brand assets or templates to store in `assets/`, or documentation to store in `references/`.

**Note:** Only create directories and files you actually need. If SKILL.md stays lean without needing these resources, skip this step. Create directories only when you have content to move out of SKILL.md.

#### Update SKILL.md

**Writing Style:** Write the entire skill using **imperative/infinitive form** (verb-first instructions), not second person. Use objective, instructional language (e.g., "To accomplish X, do Y" rather than "You should do X" or "If you need to do X"). This maintains consistency and clarity for AI consumption.

**Description (Frontmatter):** Use third-person format with specific trigger phrases:

```yaml
---
name: Skill Name
description: This skill should be used when the user asks to "specific phrase 1", "specific phrase 2", "specific phrase 3". Include exact phrases users would say that should trigger this skill. Be concrete and specific.
version: 0.1.0
---
```

**Good description examples:**
```yaml
description: This skill should be used when the user asks to "create a hook", "add a PreToolUse hook", "validate tool use", "implement prompt-based hooks", or mentions hook events (PreToolUse, PostToolUse, Stop).
```

**Bad description examples:**
```yaml
description: Use this skill when working with hooks.  # Wrong person, vague
description: Load when user needs hook help.  # Not third person
description: Provides hook guidance.  # No trigger phrases
```

To complete SKILL.md body, answer the following questions:

1. What is the purpose of the skill, in a few sentences?
2. When should the skill be used? (Include this in frontmatter description with specific triggers)
3. In practice, how should Claude use the skill? All reusable skill contents developed above should be referenced so that Claude knows how to use them.

**Keep SKILL.md lean:** Target 1,500-2,000 words for the body. Move detailed content to references/:
- Detailed patterns → `references/patterns.md`
- Advanced techniques → `references/advanced.md`
- API references → `references/api-reference.md`

**Reference resources in SKILL.md:**
```markdown
## Additional Resources

### Reference Files

For detailed patterns and techniques, consult:
- **`references/patterns.md`** - Common patterns
- **`references/advanced.md`** - Advanced use cases

### Example Files

Working examples in `examples/`:
- **`example-script.sh`** - Working example
```

### Step 5: Update Skills Index

**CRITICAL: Update the skills table of contents in `.cursor/rules/skills.mdc`**

After creating or modifying a skill, update the JSON index in `.cursor/rules/skills.mdc` to maintain parity:

1. **Open `.cursor/rules/skills.mdc`**
2. **Add new skill entry** to the JSON `skills` array with:
   - `title`: Use the skill's `name` from frontmatter
   - `description`: Use the skill's `description` from frontmatter (first sentence or core meaning)
   - `path`: Path to `.claude/skills/skill-name/SKILL.md`
   - `category`: Appropriate category (e.g., "client-state", "server-domain", "api-common", "client-feature", "tooling")
3. **Remove deleted skills** from the index when skills are removed
4. **Update existing entries** if skill name or description changes

The skills index must always reflect all skills in `.claude/skills/` and `.cursor/skills/` directories. This index serves as the table of contents for the skills system and is referenced in the system prompt.

### Step 6: Validate and Test

1. **Check structure**: Skill directory exists in both `.claude/skills/skill-name/` and `.cursor/skills/skill-name/`
2. **Verify parity**: Both locations have identical content and structure
3. **Validate SKILL.md**: Has frontmatter with name and description in both locations
4. **Check trigger phrases**: Description includes specific user queries
5. **Verify writing style**: Body uses imperative/infinitive form, not second person
6. **Test progressive disclosure**: SKILL.md is lean (~1,500-2,000 words), detailed content in references/
7. **Check references**: All referenced files exist in both locations
8. **Validate examples**: Examples are complete and correct
9. **Test scripts**: Scripts are executable and work correctly
10. **Verify skills index**: Skill is listed in `.cursor/rules/skills.mdc` JSON index

**Use the skill-reviewer agent:**
```
Ask: "Review my skill and check if it follows best practices"
```

The skill-reviewer agent will check description quality, content organization, and progressive disclosure.

### Step 7: Iterate

After testing the skill, users may request improvements. Often this happens right after using the skill, with fresh context of how the skill performed.

**Iteration workflow:**
1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify how SKILL.md or bundled resources should be updated
4. Implement changes and test again

**Common improvements:**
- Strengthen trigger phrases in description
- Move long sections from SKILL.md to references/
- Add missing examples or scripts
- Clarify ambiguous instructions
- Add edge case handling

## Skill Location

### Critical: Dual Folder Parity Requirement

**Skills MUST be kept in perfect parity between `.claude/skills/` and `.cursor/skills/` folders.**

When creating or modifying any skill:
1. **Always create/update in both locations**: `.claude/skills/` AND `.cursor/skills/`
2. **Identical content**: Both files must have exactly the same content
3. **Same file structure**: Maintain identical directory structure in both folders
4. **Synchronize immediately**: Any change to one must be immediately applied to the other

**CRITICAL EXCEPTION: MCP Tool Naming**

Claude and Cursor use different MCP tool naming formats. When working with MCP tools in skills:

- **Claude format**: `mcp__figma__get_design_context` (double underscores: `mcp__server-name__tool_name`)
- **Cursor format**: `mcp_user-Figma_get_design_context` (single underscore, different structure: `mcp_user-ServerName_tool_name`)

**When syncing skills with MCP tools:**
- Update the `allowed-tools` frontmatter field in each location with the correct format for that IDE
- Keep all other content identical between both locations
- Tool references in the skill body should use the format appropriate to the context (Claude vs Cursor)

**Workflow:**
- Create new skill → Create in both `.claude/skills/` and `.cursor/skills/`
- Modify existing skill → Update both files with identical changes (except MCP tool names in frontmatter)
- Delete skill → Remove from both locations
- Reorganize skills → Apply same structure to both folders

**Why this matters:**
- Both Claude Code and Cursor read from their respective folders
- Maintaining parity ensures consistent behavior across both IDEs
- Prevents confusion and skill availability issues
- MCP tool names must match each IDE's expected format for tools to work correctly

**Example:**
```
.claude/skills/
└── my-skill/
    ├── SKILL.md          ← Create/update here
    ├── references/
    ├── examples/
    └── scripts/

.cursor/skills/
└── my-skill/
    ├── SKILL.md          ← AND create/update here (identical content)
    ├── references/
    ├── examples/
    └── scripts/
```

### Syncing Protocol for Dual IDE Support

**CRITICAL:** When syncing skills between `.claude/skills/` and `.cursor/skills/`, follow this protocol:

1. **General Content Sync:**
   - Update SKILL.md body content identically in both locations
   - Update references/, examples/, scripts/, assets/ identically in both locations
   - Maintain identical directory structure

2. **Tool Reference Preservation:**
   - **NEVER change tool references** when syncing - they are IDE-specific
   - Claude format: `mcp__figma__get_design_context` (double underscores: `mcp__server-name__tool_name`)
   - Cursor format: `mcp_user-Figma_get_design_context` (single underscore, different structure: `mcp_user-ServerName_tool_name`)
   - When syncing, identify `allowed-tools` frontmatter field and preserve IDE-specific format
   - Tool references in skill body should use format appropriate to context (Claude vs Cursor)

3. **Sync Workflow:**
   - Make content changes to one location
   - Copy content changes to other location
   - Verify tool references remain IDE-specific in each location
   - Test that both skills work in their respective IDEs

**Why this matters:**
- General content updates (instructions, examples, references) should be synchronized
- Tool references must remain IDE-specific for tools to function correctly
- Following this protocol ensures skills work in both IDEs without breaking tool functionality

### Auto-Discovery

Skills are automatically discovered:
- Scans `skills/` directory in both `.claude/` and `.cursor/` locations
- Finds subdirectories containing `SKILL.md`
- Loads skill metadata (name + description) always
- Loads SKILL.md body when skill triggers
- Loads references/examples when needed

## Progressive Disclosure in Practice

### What Goes in SKILL.md

**Include (always loaded when skill triggers):**
- Core concepts and overview
- Essential procedures and workflows
- Quick reference tables
- Pointers to references/examples/scripts
- Most common use cases

**Keep under 3,000 words, ideally 1,500-2,000 words**

### What Goes in references/

**Move to references/ (loaded as needed):**
- Detailed patterns and advanced techniques
- Comprehensive API documentation
- Edge cases and troubleshooting
- Extensive examples and walkthroughs

**Each reference file can be large (2,000-5,000+ words)**

### What Goes in examples/

**Working code examples:**
- Complete, runnable scripts
- Configuration files
- Template files
- Real-world usage examples

**Users can copy and adapt these directly**

### What Goes in scripts/

**Utility scripts:**
- Validation tools
- Testing helpers
- Parsing utilities
- Automation scripts

**Should be executable and documented**

## Writing Style Requirements

### Imperative/Infinitive Form

Write using verb-first instructions, not second person:

**Correct (imperative):**
```
To create a hook, define the event type.
Configure the MCP server with authentication.
Validate settings before use.
```

**Incorrect (second person):**
```
You should create a hook by defining the event type.
You need to configure the MCP server.
You must validate settings before use.
```

### Third-Person in Description

The frontmatter description must use third person:

**Correct:**
```yaml
description: This skill should be used when the user asks to "create X", "configure Y"...
```

**Incorrect:**
```yaml
description: Use this skill when you want to create X...
description: Load this skill when user asks...
```

### Objective, Instructional Language

Focus on what to do, not who should do it:

**Correct:**
```
Parse the frontmatter using sed.
Extract fields with grep.
Validate values before use.
```

**Incorrect:**
```
You can parse the frontmatter...
Claude should extract fields...
The user might validate values...
```

## Validation Checklist

Before finalizing a skill:

**Structure:**
- [ ] Skill exists in both `.claude/skills/` and `.cursor/skills/` directories
- [ ] Both locations have identical content and structure
- [ ] SKILL.md file exists with valid YAML frontmatter in both locations
- [ ] Frontmatter has `name` and `description` fields
- [ ] Markdown body is present and substantial
- [ ] Referenced files actually exist in both locations

**Description Quality:**
- [ ] Uses third person ("This skill should be used when...")
- [ ] Includes specific trigger phrases users would say
- [ ] Lists concrete scenarios ("create X", "configure Y")
- [ ] Not vague or generic

**Content Quality:**
- [ ] SKILL.md body uses imperative/infinitive form
- [ ] Body is focused and lean (1,500-2,000 words ideal, <5k max)
- [ ] Detailed content moved to references/
- [ ] Examples are complete and working
- [ ] Scripts are executable and documented

**Progressive Disclosure:**
- [ ] Core concepts in SKILL.md
- [ ] Detailed docs in references/
- [ ] Working code in examples/
- [ ] Utilities in scripts/
- [ ] SKILL.md references these resources

**Testing:**
- [ ] Skill triggers on expected user queries
- [ ] Content is helpful for intended tasks
- [ ] No duplicated information across files
- [ ] References load when needed

## Common Mistakes to Avoid

### Mistake 1: Weak Trigger Description

❌ **Bad:**
```yaml
description: Provides guidance for working with hooks.
```

**Why bad:** Vague, no specific trigger phrases, not third person

✅ **Good:**
```yaml
description: This skill should be used when the user asks to "create a hook", "add a PreToolUse hook", "validate tool use", or mentions hook events. Provides comprehensive hooks API guidance.
```

**Why good:** Third person, specific phrases, concrete scenarios

### Mistake 2: Too Much in SKILL.md

❌ **Bad:**
```
skill-name/
└── SKILL.md  (8,000 words - everything in one file)
```

**Why bad:** Bloats context when skill loads, detailed content always loaded

✅ **Good:**
```
skill-name/
├── SKILL.md  (1,800 words - core essentials)
└── references/
    ├── patterns.md (2,500 words)
    └── advanced.md (3,700 words)
```

**Why good:** Progressive disclosure, detailed content loaded only when needed

### Mistake 3: Second Person Writing

❌ **Bad:**
```markdown
You should start by reading the configuration file.
You need to validate the input.
You can use the grep tool to search.
```

**Why bad:** Second person, not imperative form

✅ **Good:**
```markdown
Start by reading the configuration file.
Validate the input before processing.
Use the grep tool to search for patterns.
```

**Why good:** Imperative form, direct instructions

### Mistake 4: Missing Resource References

❌ **Bad:**
```markdown
# SKILL.md

[Core content]

[No mention of references/ or examples/]
```

**Why bad:** Claude doesn't know references exist

✅ **Good:**
```markdown
# SKILL.md

[Core content]

## Additional Resources

### Reference Files
- **`references/patterns.md`** - Detailed patterns
- **`references/advanced.md`** - Advanced techniques

### Examples
- **`examples/script.sh`** - Working example
```

**Why good:** Claude knows where to find additional information

## Quick Reference

### Minimal Skill

```
skill-name/
└── SKILL.md
```

Good for: Simple knowledge, no complex resources needed

### Standard Skill (Recommended)

```
skill-name/
├── SKILL.md
├── references/
│   └── detailed-guide.md
└── examples/
    └── working-example.sh
```

Good for: Most skills with detailed documentation

### Complete Skill

```
skill-name/
├── SKILL.md
├── references/
│   ├── patterns.md
│   └── advanced.md
├── examples/
│   ├── example1.sh
│   └── example2.json
└── scripts/
    └── validate.sh
```

Good for: Complex domains with validation utilities

## Best Practices Summary

✅ **DO:**
- Maintain parity between `.claude/skills/` and `.cursor/skills/` directories
- Use third-person in description ("This skill should be used when...")
- Include specific trigger phrases ("create X", "configure Y")
- Keep SKILL.md lean (1,500-2,000 words)
- Use progressive disclosure (move details to references/)
- Write in imperative/infinitive form
- Reference supporting files clearly
- Provide working examples
- Create utility scripts for common operations
- Study existing skills as templates

❌ **DON'T:**
- Use second person anywhere
- Have vague trigger conditions
- Put everything in SKILL.md (>3,000 words without references/)
- Write in second person ("You should...")
- Leave resources unreferenced
- Include broken or incomplete examples
- Skip validation

## Additional Resources

### Study These Skills

Existing skills in this codebase demonstrate best practices:
- **`building-csv-imports`** - Shows lean SKILL.md with pattern-focused content, references to example files
- **`building-paginated-routes-api`** - Demonstrates concise pattern documentation with variations and gotchas
- **`building-tabbed-forms-ssr-jotai`** - Example of progressive disclosure with workflow guidance
- **`building-sending-notifications`** - Shows domain-specific pattern documentation

These skills demonstrate:
- Progressive disclosure patterns
- Reference file organization
- Example implementations
- Script utilities

### Reference Files

For complete skill-creator methodology:
- **`references/skill-creator-original.md`** - Full original skill-creator content

## Implementation Workflow

To create a skill:

1. **Understand use cases**: Identify concrete examples of skill usage
2. **Plan resources**: Determine what scripts/references/examples/assets needed (if any)
3. **Create structure**: Create SKILL.md in both `.claude/skills/skill-name/` and `.cursor/skills/skill-name/`
4. **Write SKILL.md**: Create identical files in both locations
   - Frontmatter with third-person description and trigger phrases
   - Lean body (1,500-2,000 words) in imperative form
   - Reference supporting files (if created)
5. **Add resources**: Create references/, examples/, scripts/, assets/ in both locations only when needed (when moving content out of SKILL.md)
6. **Validate**: Check description, writing style, organization, and parity between both locations
7. **Test**: Verify skill loads on expected triggers in both IDEs
8. **Iterate**: Improve based on usage, maintaining parity in both locations

**Critical:** Always maintain perfect parity between `.claude/skills/` and `.cursor/skills/` directories. Any change to one location must be immediately applied to the other.

Focus on strong trigger descriptions, progressive disclosure, and imperative writing style for effective skills that load when needed and provide targeted guidance.
