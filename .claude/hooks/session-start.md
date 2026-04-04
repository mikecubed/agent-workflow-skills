---
hook: session-start
runtime: claude-code
---

# Session Continuity — SESSION.md Hook

**Trigger**: fires at the beginning of every Claude Code session in this project.

## Behavior

### If `.agent/SESSION.md` does not exist

Proceed normally. Do not mention SESSION.md.

### If `.agent/SESSION.md` exists and is valid

Within the **first response turn**, announce the session state without waiting to be asked:

```
Resuming from session checkpoint — [current-task] / [current-phase]
Next action: [next-action]
Workspace: [workspace]
```

If `## Blockers` is non-empty, list the blockers and ask:
> "These blockers were recorded in the last session. Have any of them been resolved?"

Wait for the developer's response before proceeding with work.

If `.agent/HANDOFF.json` is also present, it is the machine-readable companion — no special
action needed, it will be written alongside SESSION.md updates.

### If `.agent/SESSION.md` exists but is malformed

A file is malformed if the YAML frontmatter fails to parse, or any of the five required
fields (`current-task`, `current-phase`, `next-action`, `workspace`, `last-updated`) are
missing.

Report the parse failure to the developer:
> "`.agent/SESSION.md` exists but could not be parsed (missing or invalid YAML frontmatter).
> Proceeding as if no session checkpoint exists."

Then continue normally as if the file is absent.

## HANDOFF.json Fallback

When SESSION.md is absent or malformed, check for `.agent/HANDOFF.json`:

- **If absent**: proceed normally.
- **If present and valid JSON with required fields** (`schema-version`, `current-task`,
  `current-phase`, `next-action`, `workspace`, `last-updated`): use it as the session state
  source. Announce the session state in the same format as SESSION.md:
  ```
  Resuming from session checkpoint — [current-task] / [current-phase]
  Next action: [next-action]
  Workspace: [workspace]
  ```
  If `blockers` is non-empty, list the blockers and ask whether they have been resolved.
- **If present but malformed JSON**: report the parse failure to the developer:
  > "`.agent/HANDOFF.json` exists but could not be parsed (invalid JSON).
  > Proceeding as if no session checkpoint exists."

  Then continue normally as if the file is absent.

## Schema reference

See `plugins/workflow-orchestration/docs/session-md-schema.md` for the canonical SESSION.md
and HANDOFF.json formats, field definitions, and writer/reader rules.
