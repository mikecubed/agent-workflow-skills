---
description: "Create an implementation plan from a feature specification."
handoffs:
  - label: Generate Task List
    agent: sdd-tasks
    prompt: Break the plan into actionable tasks
    send: true
  - label: Iterate on Plan
    agent: sdd-plan
    prompt: Refine the implementation plan in the current .sdd/{feature-dir} workspace
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Flow Agent Contract

This is a Copilot agent in the `flow` plugin, not a standalone command plugin.
Keep handoffs and references in `flow` form (`sdd-tasks`, `sdd-plan`, and
`/flow:sdd-*`) and write all artifacts under the repository-local `.sdd/`
workspace.

## Outline

1. **Check for headless mode**.
   - If `$ARGUMENTS` contains `headless` or `--headless`, enable headless mode.
   - In headless mode, use reasonable defaults and record assumptions in the plan instead of pausing.

2. **Locate the feature directory**.
   - Prefer a feature directory explicitly named in `$ARGUMENTS`.
   - Prefer a feature directory explicitly named in `$ARGUMENTS` or the handoff context.
   - Otherwise, find the most recent `.sdd/{feature-dir}/spec.md`.
   - If multiple candidates are plausible and headless mode is not active, ask the user to choose.

3. **Load the specification** from `.sdd/{feature-dir}/spec.md`.
   - Preserve requirement IDs, user stories, acceptance scenarios, and success criteria.
   - If the spec contains `[NEEDS CLARIFICATION: ...]` markers, resolve them before planning unless headless mode is active.

4. **Load the existing `plan.md` when iterating**.
   - If `.sdd/{feature-dir}/plan.md` already exists, read it before generating updates.
   - Preserve prior assumptions, risk notes, manual edits, and design decisions unless the current request explicitly changes them.
   - Update only the sections implicated by the changed spec or user request.
   - Record superseded assumptions instead of silently deleting them.

5. **Use the canonical plan template** with these sections:
   - Summary
   - Technical Context
   - Constitution / Quality Gates
   - Project Structure
   - Phase 0: Research
   - Phase 1: Design and Contracts
   - Phase 2: Task Planning Approach
   - Complexity Tracking
   - Progress Tracking

6. **Fill or refine the plan template**.
   - Map each design choice back to the relevant requirement or user story.
   - Keep the plan implementation-oriented but avoid writing the task list here.
   - Record risks, assumptions, and validation commands.

7. **Generate or update supporting artifacts as needed**:
   - `.sdd/{feature-dir}/research.md`
   - `.sdd/{feature-dir}/data-model.md`
   - `.sdd/{feature-dir}/contracts/`
   - `.sdd/{feature-dir}/quickstart.md`

8. **Write** the plan to `.sdd/{feature-dir}/plan.md`.

9. **Report completion** with paths to all generated artifacts, whether this was a new plan or an in-place refinement, and the recommended handoff to `sdd-tasks`.
