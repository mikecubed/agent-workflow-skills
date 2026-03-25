# Model Preferences — Config Templates

The `agent-workflow-skills` plugin looks for a runtime-specific config file in
your project root to override the default models used for each role.

Create the file for your runtime (or both) and edit the model names as needed.
Update these files whenever you want to switch to a newer model release.

---

## Copilot CLI — `.copilot/models.md`

Create `.copilot/models.md` in your project root with the following content:

```yaml
# Models used by agent-workflow-skills in Copilot CLI
# parallel-implementation-loop and pr-review-resolution-loop
implementer: claude-opus-4.6
reviewer: gpt-5.4

# final-pr-readiness-gate
structured-check: gpt-5.4
final-reviewer: gpt-5.4
```

---

## Claude Code — `.claude/models.md`

Create `.claude/models.md` in your project root with the following content:

```yaml
# Models used by agent-workflow-skills in Claude Code
# parallel-implementation-loop and pr-review-resolution-loop
implementer: claude-opus-4.6
reviewer: claude-opus-4.6

# final-pr-readiness-gate
structured-check: claude-opus-4.6
final-reviewer: claude-opus-4.6
```

---

## Key reference

| Key               | Used by skill(s)                                          | Role                        |
|-------------------|-----------------------------------------------------------|-----------------------------|
| `implementer`     | parallel-implementation-loop, pr-review-resolution-loop  | Makes code changes          |
| `reviewer`        | parallel-implementation-loop, pr-review-resolution-loop  | Reviews diffs               |
| `structured-check`| final-pr-readiness-gate                                   | Runs structured code checks |
| `final-reviewer`  | final-pr-readiness-gate                                   | Whole-diff final review     |
