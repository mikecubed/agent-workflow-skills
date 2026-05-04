---
description: "Generate an actionable, dependency-ordered task list from the feature plan."
handoffs:
  - label: Iterate on Tasks
    agent: sdd-tasks
    prompt: Refine the task list
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Flow Agent Contract

This is a Copilot agent in the `flow` plugin, not a standalone command plugin.
Keep handoffs and references in `flow` form (`sdd-tasks` and `/flow:sdd-*`)
and write all artifacts under the repository-local `.sdd/` workspace.

## Outline

1. **Check for headless mode**.
   - If `$ARGUMENTS` contains `headless` or `--headless`, enable headless mode.
   - In headless mode, use reasonable defaults and record assumptions in `tasks.md`.

2. **Locate the feature directory**.
   - Prefer a feature directory explicitly named in `$ARGUMENTS`.
   - Otherwise, find the most recent `.sdd/{feature-dir}/plan.md`.
   - If multiple candidates are plausible and headless mode is not active, ask the user to choose.

3. **Load** `plan.md`, `spec.md`, and optional supporting design docs.
   - Include `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` when present.
   - Preserve traceability to user stories, requirements, contracts, and validation gates.

4. **Generate** a dependency-ordered task list by user story using the strict `T###` format.
   - Every task must be actionable and independently checkable.
   - Mark tasks that can run in parallel with `[P]`.
   - Keep tasks grouped by user story so each story can be implemented and tested independently.
   - Include test tasks before implementation tasks where the plan requires tests.
   - Include integration, validation, and documentation tasks where required by the plan.

5. **Write** tasks to `.sdd/{feature-dir}/tasks.md`.

6. **Report** total task count, per-story breakdown, parallelization opportunities, and suggested MVP scope.
