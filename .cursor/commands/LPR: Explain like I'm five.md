---
description: Explain code clearly and directly with deep analysis
argument-hint: [file-path]
---

$IF($1,
  Analyze the code in @$1 deeply as a senior engineer, then explain it clearly and directly.,
  Analyze the Lightning PR codebase as a whole deeply as a systems architect, then explain it clearly and directly.
)

**Investigation phase:**
- Understand the code both semantically (from names and structure) and literally (actual execution flow)
- Trace all child functions, dependencies, and related code
- Find real usage examples in the codebase to understand context
- Identify the code's role in the broader system

**Explanation phase (direct and technical for knowledge transfer):**
- What the code does and why it exists
- How to use it with concrete examples from the codebase
- Key things to know, watch out for, and special nuances noticed
- What depends on this code and what this code depends on

Use clear, direct language. Avoid analogies or metaphors. Explain the code's actual behavior, purpose, and usage patterns in straightforward technical terms.