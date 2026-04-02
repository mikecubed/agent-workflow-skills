# Tasks: Workflow Skill Throughput and Coordination Improvements

**Input**: Design documents from `.sdd/workflow-throughput-9f2k4m1q/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `- [ ] T### [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational

**Purpose**: Shared infrastructure (artifact templates and model config) that all user-story skill changes depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 Add Discovery Brief template section to `docs/workflow-artifact-templates.md` after the existing "Final readiness report" section and before "When to use these templates." Include all fields from `data-model.md`: task-summary, task-shape (enum: `single-track` / `multi-track-batch` / `review-resolution-batch` / `large-diff-readiness`), relevant-files, task-boundaries, validation-commands, dependencies (conditional), comparison-baseline (conditional), open-questions, skip-reason (conditional). Include lifecycle notes (created before track launch, consumed by coordinator and specialists, retired at workflow completion) and skip condition (narrow/fully-scoped tasks).
- [ ] T002 [P] Add `scout` key to both runtime config examples in `docs/models-config-template.md`. Add `scout: claude-haiku-4.5` under both the Copilot CLI and Claude Code YAML blocks. Add a `scout` row to the Key reference table: used by all three skills, role description "Runs bounded discovery/triage before expensive delegation."

**Checkpoint**: Shared templates and model config ready — skill protocol changes can begin.

---

## Phase 2: User Story 1 — Faster bounded workflow execution (Priority: P1) 🎯 MVP

**Goal**: Add bounded discovery behavior and replace "no shared context" with "shared facts, independent judgment" in all three skills (plan Phase 1; FR-001, FR-002).

**Independent Test**: Invoke a bounded workflow on a multi-track task and confirm that the workflow uses one shared factual brief rather than making each specialist rediscover the same files.

- [ ] T003 [P] [US1] Update `skills/parallel-implementation-loop/SKILL.md` — all discovery-tier changes: (a) Add "Discovery Phase" subsection to Workflow between current Step 1 "Establish the implementation baseline" and current Step 2 "Launch implementation tracks." Include: scout runs first with fast/cheap model, produces a Discovery Brief artifact per `docs/workflow-artifact-templates.md`, coordinator shares factual brief with implementers and reviewers, explicit skip condition for narrow/fully-scoped tasks. (b) Replace context-sharing sentence in Default Roles at line 48 ("Do not share context between roles.") with factual-brief policy: "Keep implementation and review judgment separate. The coordinator may share a factual brief that includes task boundaries, files, validation commands, and known dependencies. Do not share proposed solutions, review verdicts, or evaluative conclusions." (c) Add `scout` role to Model Selection: update config file format YAML example to include `scout: <model-name>`, add scout row to Default models table (Copilot CLI: `claude-haiku-4.5`, Claude Code: `claude-haiku-4.5`).
- [ ] T004 [P] [US1] Update `skills/pr-review-resolution-loop/SKILL.md` — all discovery-tier changes: (a) Add triage-discovery step to Workflow Step 1 "Gather review context": before collecting threads, run a scout pass to classify and batch review items, produce a review-context brief with affected files, validation commands, and scope boundaries; skip when resolving a single already-triaged comment. (b) Update Default Roles context-sharing language at line 40: after "Pass the reviewer only the resulting diff and the review criteria." add factual-brief policy consistent with T003(b). (c) Add `scout` role to Model Selection: update config YAML example and Default models table with scout defaults (`claude-haiku-4.5` for both runtimes).
- [ ] T005 [P] [US1] Update `skills/final-pr-readiness-gate/SKILL.md` — all discovery-tier changes: (a) Add pre-slicer discovery step to Workflow Step 1 "Establish the stable review surface": before structured checks, run a scout pass to identify diff structure, affected modules, and known review surface; reuse already-known stable review surface instead of rediscovering; skip for small/focused diffs. (b) Add `scout` role to Model Selection: update config YAML example to include `scout: <model-name>`, add scout row to Default models table (`claude-haiku-4.5` for both runtimes).
- [ ] T006 [US1] Run `npm test` to validate all three skills retain required sections (Purpose, When to Use It, Project-Specific Inputs, Workflow, Required Gates, Stop Conditions, Example) and frontmatter integrity after Phase 2 changes.

**Checkpoint**: Discovery tier integrated into all three skills; factual-brief policy active; `npm test` passes.

---

## Phase 3: User Story 2 — Better coordination of slow or stalled subagents (Priority: P2)

**Goal**: Add explicit progress-based waiting, rescue policy, and bounded resend loops to all three skills (plan Phase 2; FR-003, FR-004).

**Independent Test**: Run a bounded workflow where one subagent is slow and confirm that the coordinator uses a rescue or resend path before stopping the workflow.

- [ ] T007 [P] [US2] Update `skills/parallel-implementation-loop/SKILL.md` — rescue policy changes: (a) Add "Coordinator Progress and Rescue Policy" subsection to Workflow after the new Discovery Phase and before Step 3 "Review each completed track." Define state transitions per research.md Decision 3: soft budget (progress visible → keep waiting) → rescue (soft budget exceeded, no clear progress → re-scope / targeted-resend / serialize / reduce-context / escalate-to-developer) → hard budget (rescue failed → stopped). Include progress indicators: files being modified, tests being added, validation being run, partial results returned. Limit rescue attempts to 2 per track before hard stop or developer escalation. (b) Add bounded resend loop language to Workflow Step 4 "Revise if needed": when reviewer returns substantive issues, coordinator sends a Targeted Resend per `contracts/handoff-contracts.md` Contract 5 (unresolved issue IDs, constrained scope, acceptance criteria, validation to rerun, escalation condition). (c) Update Stop Conditions: add "rescue-before-abandon" — a track must not be abandoned until at least one rescue attempt has been made or the hard budget is exceeded.
- [ ] T008 [P] [US2] Update `skills/pr-review-resolution-loop/SKILL.md` — rescue policy changes: (a) Add rescue policy for stalled fix attempts to Workflow between Step 4 "Implement each accepted fix" and Step 5 "Review each fix": when an implementer fix stalls or exceeds budget, coordinator runs a bounded rescue (re-scope fix, reduce context, or serialize coupled fixes). (b) Add bounded resend loop for reviewer-implementer follow-up after Step 5: coordinator may issue a targeted resend with only unresolved issues and constrained scope; limit to 2 resend attempts per fix before escalation. (c) Update Stop Conditions: strengthen "reviewer and implementer disagree without a repository rule to break the tie" with rescue-before-abandon policy — attempt rescue or re-scope before stopping.
- [ ] T009 [P] [US2] Update `skills/final-pr-readiness-gate/SKILL.md` — rescue policy changes: (a) Add policy for handling structured checker stalls or large-diff processing delays to Workflow between Step 3 "Run structured checks" and Step 4 "Triage structured findings": if a structured checker exceeds its budget, coordinator may reduce diff scope, skip non-critical checks, or serialize checks rather than abandoning the gate. (b) Update Stop Conditions: add rescue-before-abandon language for the structured check phase — attempt scope reduction before declaring the gate untestable.
- [ ] T010 [US2] Run `npm test` to validate all three skills retain structural integrity after Phase 3 changes.

**Checkpoint**: Rescue policy and bounded resend loops active in all three skills; `npm test` passes.

---

## Phase 4: User Story 3 — Durable, auditable workflow handoffs (Priority: P3)

**Goal**: Promote artifacts from advisory to required in skill gates and update templates with status tracking (plan Phase 3; FR-005).

**Independent Test**: Execute a bounded workflow and confirm it produces durable artifact updates with status, next-action, and unresolved work for each track.

- [ ] T011 Update `docs/workflow-artifact-templates.md` — extend existing templates: (a) Extend "Parallel implementation track report" with Workflow Track State fields per `data-model.md`: state (enum: pending / active / review / revision / merged / rescue / serialized / escalated / blocked / abandoned), validation-outcome, unresolved-issues, rescue-history, next-action, revision-rounds. (b) Extend "Review-resolution summary" with: current-state, unresolved-questions, next-action fields. (c) Extend "Final readiness report" with: current-state, unresolved-questions, next-action fields.
- [ ] T012 [P] [US3] Update `skills/parallel-implementation-loop/SKILL.md` Required Gates: (a) Add to Track gate: "a durable track report artifact MUST be updated before declaring the track complete" with reference to `docs/workflow-artifact-templates.md`. (b) Add to Batch gate: "a batch summary artifact MUST be produced before declaring the batch complete." (c) Clarify in Workflow Step 7 "Record the batch outcome" that "durable" means a repository-appropriate sink (PR description, committed doc, issue comment, or task tracker entry) — not necessarily a committed Markdown file in every repository.
- [ ] T013 [P] [US3] Update `skills/pr-review-resolution-loop/SKILL.md` Required Gates: (a) Add to Review batch gate: "a resolution summary artifact MUST be produced before declaring the batch complete." (b) Strengthen Workflow Step 7 "Final validation" language from "publish one durable review-resolution summary … when the repository has a place for it" to MUST: "publish one durable review-resolution summary that captures decisions, validation, and remaining concerns." Reference `docs/workflow-artifact-templates.md`.
- [ ] T014 [P] [US3] Update `skills/final-pr-readiness-gate/SKILL.md` Required Gates: (a) Strengthen to MUST: "a readiness report artifact MUST be produced before declaring the gate complete." (b) Reference `docs/workflow-artifact-templates.md` in Workflow Step 7 "Report clearly."
- [ ] T015 [US3] Run `npm test` to validate structural integrity after Phase 4 changes.

**Checkpoint**: Durable artifact production is a gate requirement in all three skills; templates extended; `npm test` passes.

---

## Phase 5: Convergence, Disagreement, and Outcome Measures

**Purpose**: Add explicit convergence rules, disagreement escalation, and lightweight outcome measure recording (plan Phase 4; FR-006, FR-007). Cross-cutting across US2 and US3.

- [ ] T016 Add "Workflow outcome measures" template section to `docs/workflow-artifact-templates.md` after the extended templates and before "When to use these templates." Include fields per `data-model.md`: discovery-reuse (yes / no / skipped), rescue-attempts (integer), abandonment-events (integer), re-review-loops (map of track → count), final-gate-result (ready / ready-with-follow-ups / not-ready / stopped). Include recording rules: populated at workflow completion in batch summary; partial measures recorded with interruption note if workflow stops early.
- [ ] T017 [P] [US2] Update `skills/parallel-implementation-loop/SKILL.md` — convergence and outcome measures: (a) Add convergence rules to Workflow Step 4 "Revise if needed": same issue raised twice → escalate to coordinator (not back to implementer); scope growth beyond original boundary → stop and re-scope before continuing; material implementer-reviewer disagreement after one exchange → developer escalation; default maximum 2 revision rounds per track before escalation (configurable in project-specific inputs). (b) Add convergence failure entries to Stop Conditions. (c) Add outcome measure recording to Workflow Step 7 "Record the batch outcome": require the batch summary to include discovery-reuse, rescue-attempts, abandonment-events, and re-review-loops per track; reference the outcome measures template.
- [ ] T018 [P] [US2] Update `skills/pr-review-resolution-loop/SKILL.md` — convergence and outcome measures: (a) Add disagreement resolution to Workflow and Stop Conditions: fix-vs-decline conflict on same comment → developer escalation after one re-review; repeated fix failure on same issue → re-scope or decline with documented rationale. (b) Add outcome measures to Workflow Step 7 "Final validation": resolution summary MUST include discovery-reuse, rescue-attempts, and re-review-loops fields.
- [ ] T019 [P] [US3] Update `skills/final-pr-readiness-gate/SKILL.md` — outcome measures: Add outcome measures to Workflow Step 7 "Report clearly": readiness report MUST include discovery-reuse, rescue-attempts, and final-gate-result fields per outcome measures template.
- [ ] T020 Run `npm test` to validate structural integrity after Phase 5 changes.

**Checkpoint**: Convergence rules and outcome measures integrated in all three skills; `npm test` passes.

---

## Phase 6: Polish — Documentation, Tests, and Exclusions

**Purpose**: Update supporting docs, strengthen structural tests, add exclusion language, and run final validation (plan Phase 5; FR-008, SC-004).

- [ ] T021 [P] Update `test/plugin-layout.test.js`: add lightweight phrase assertions to the existing `shared skills layout` describe block. For each of the three skills, assert presence of: (a) `factual brief` or `shared facts` language (validates Phase 2 discovery policy); (b) `rescue` language (validates Phase 3 rescue policy); (c) `durable` combined with `artifact` or `report` (validates Phase 4 artifact gates); (d) `out of scope` referencing persistent team, squad, or fleet (validates exclusion language from T024).
- [ ] T022 [P] Update `docs/coordinator-subagent-recommendations.md`: (a) Add implementation-status annotations to Recommendations 1–6: for each, note the skill(s) and plan phase where it was addressed (e.g., "Recommendation 1 — Implemented: Discovery phase added to all three skills in plan Phase 1"). (b) Add an explicit non-goal fence to the "Would a pre-created persistent team be better?" section (line ~292) and the "When team orchestration is worth it" section (line ~356): "These sections describe potential future work that composes with the bounded workflow skills. They are not part of the current throughput improvement feature (see FR-008)."
- [ ] T023 [P] Update `docs/skills-evaluation.md` Gaps table (line ~188): (a) Change "Artifact-based memory" row status from "Partial" to "Complete" with note: "Skills now require durable artifact production as a gate condition; templates extended with state, next-action, and outcome fields." (b) Change "Adversarial review and self-critique" row status from "Partial" to "Complete" with note: "Convergence rules, disagreement escalation, and maximum revision rounds now specified in all three skills."
- [ ] T024 Add explicit exclusion language to each skill's Purpose or When to Use It section in: `skills/parallel-implementation-loop/SKILL.md`, `skills/pr-review-resolution-loop/SKILL.md`, and `skills/final-pr-readiness-gate/SKILL.md`. Add: "Persistent team, squad, or fleet-style long-lived orchestration is out of scope for this skill. Use a separate orchestration layer if persistent coordination is needed." Place after the existing Purpose paragraph in each file.
- [ ] T025 Run `npm test` and `npm run validate:runtime` as final validation gate. All structural tests (including new phrase assertions from T021) and runtime checks must pass.

**Checkpoint**: All documentation updated; structural tests strengthened; exclusion language verified; `npm test` ✓; `npm run validate:runtime` ✓.

---

## Dependencies & Execution Order

```text
Phase 1 (Foundational)
  ├── T001 ──┐
  └── T002 ──┤ (parallel: different files)
             ▼
Phase 2 (US1 — Discovery + factual brief)
  ├── T003 ──┐
  ├── T004 ──┤ (parallel: different SKILL.md files)
  ├── T005 ──┤
  └── T006 ──┘ (sequential: validation after all skill changes)
             ▼
Phase 3 (US2 — Rescue policy)
  ├── T007 ──┐
  ├── T008 ──┤ (parallel: different SKILL.md files)
  ├── T009 ──┤
  └── T010 ──┘ (sequential: validation)
             ▼
Phase 4 (US3 — Durable artifacts)
  ├── T011 ──┐ (template changes first)
  ├── T012 ──┤
  ├── T013 ──┤ (parallel: different SKILL.md files, after T011)
  ├── T014 ──┤
  └── T015 ──┘ (sequential: validation)
             ▼
Phase 5 (Cross-cutting — Convergence + measures)
  ├── T016 ──┐ (template changes first)
  ├── T017 ──┤
  ├── T018 ──┤ (parallel: different SKILL.md files, after T016)
  ├── T019 ──┤
  └── T020 ──┘ (sequential: validation)
             ▼
Phase 6 (Polish — Docs, tests, exclusions)
  ├── T021 ──┐
  ├── T022 ──┤ (parallel: different files)
  ├── T023 ──┤
  ├── T024 ──┤ (all three SKILL.md files — after T021 content is known)
  └── T025 ──┘ (sequential: final validation)
```

- **Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6**
- Phases are sequenced because each modifies the same three SKILL.md files in different sections; ordering avoids merge conflicts and respects content dependencies (discovery before rescue, rescue before durable artifacts, all protocol changes before convergence rules)
- Within each phase: `[P]`-tagged tasks can run in parallel (they target different files)
- Template/doc tasks within a phase should complete before or alongside skill changes
- Phase 6 depends on all skill changes being complete since it adds test assertions for content from Phases 2–5

---

## Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | **25** |
| Phase 1 — Foundational (templates + model config) | 2 |
| Phase 2 — US1: Discovery + factual brief | 4 |
| Phase 3 — US2: Rescue policy + bounded resend | 4 |
| Phase 4 — US3: Durable artifact gates | 5 |
| Phase 5 — Convergence + outcome measures | 5 |
| Phase 6 — Polish (docs, tests, exclusions) | 5 |

### Per-Story Breakdown

| Story | Primary Tasks | Supporting Tasks |
|-------|--------------|-----------------|
| US1 — Faster bounded workflow | T003, T004, T005, T006 | T001, T002 (foundational) |
| US2 — Better coordination | T007, T008, T009, T010, T017, T018 | — |
| US3 — Durable handoffs | T012, T013, T014, T015, T019 | T011, T016 (templates) |

### Files Modified

| File | Tasks |
|------|-------|
| `skills/parallel-implementation-loop/SKILL.md` | T003, T007, T012, T017, T024 |
| `skills/pr-review-resolution-loop/SKILL.md` | T004, T008, T013, T018, T024 |
| `skills/final-pr-readiness-gate/SKILL.md` | T005, T009, T014, T019, T024 |
| `docs/workflow-artifact-templates.md` | T001, T011, T016 |
| `docs/models-config-template.md` | T002 |
| `docs/coordinator-subagent-recommendations.md` | T022 |
| `docs/skills-evaluation.md` | T023 |
| `test/plugin-layout.test.js` | T021 |

**Suggested MVP scope**: Phases 1–2 (T001–T006, 6 tasks). This delivers the highest-leverage improvement — bounded discovery and shared factual briefs — and is independently testable and mergeable per the plan's Phase 1 validation gate.
