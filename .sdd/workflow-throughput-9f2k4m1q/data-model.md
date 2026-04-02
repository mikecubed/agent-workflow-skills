# Data Model: Workflow Skill Throughput and Coordination Improvements

**Date**: 2026-04-02 | **Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)

## Entities

This feature introduces four key entities. All are recorded as Markdown artifacts (no database, no structured storage). Templates for each are added to `docs/workflow-artifact-templates.md`.

---

### 1. Discovery Brief

A reusable factual summary produced once per bounded workflow execution (batch or session). The coordinator or a cheap scout-tier model prepares this before delegating to expensive specialists.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task-summary` | Text | Yes | One-paragraph description of the work to be done |
| `task-shape` | Enum | Yes | `single-track` · `multi-track-batch` · `review-resolution-batch` · `large-diff-readiness` |
| `relevant-files` | List of paths | Yes | Files and modules relevant to the batch |
| `task-boundaries` | Text | Yes | What is in scope and what is not |
| `validation-commands` | List of commands | Yes | How to validate the work (test commands, lint, type-check) |
| `dependencies` | List | Conditional | Known dependencies or shared interfaces across tracks (required if multi-track) |
| `comparison-baseline` | Text | Conditional | Branch, commit, or PR reference for diff comparison (required for review/readiness skills) |
| `open-questions` | List | No | Questions that still require developer input before proceeding |
| `skip-reason` | Text | Conditional | If discovery was skipped, why (e.g., "single file, fully scoped bug fix") |

**Lifecycle**:
- Created: at the start of a workflow execution, before track launch or triage
- Consumed: by coordinator for track splitting; by implementers and reviewers as factual context
- Updated: only if the coordinator discovers material new information during execution
- Retired: at workflow completion (persists in artifact store for resumability)

**Skip condition**: Discovery is skipped when the task is already narrow and fully scoped (one file, one well-defined bug fix, one known test failure, one already-triaged review comment). When skipped, the `skip-reason` field is recorded.

---

### 2. Workflow Track State

A durable record of one delegated unit of work. This extends the existing track definition template from `docs/workflow-artifact-templates.md` with explicit state tracking, rescue history, and next-action fields.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `track-name` | Text | Yes | Human-readable identifier |
| `task-ids` | List | Yes | Task or item identifiers assigned to this track |
| `owner-role` | Enum | Yes | `implementer` · `reviewer` · `coordinator` · `scout` |
| `files` | List of paths | Yes | Files owned or affected by this track |
| `validation-command` | Text | Yes | Command to validate this track's work |
| `work-surface` | Text | Yes | Branch, worktree, or PR reference |
| `state` | Enum | Yes | See State Transitions below |
| `validation-outcome` | Enum | Conditional | `pass` · `fail` · `partial` · `not-run` (required when state is `review` or later) |
| `unresolved-issues` | List | No | Issues still open for this track |
| `rescue-history` | List of Rescue Actions | No | Record of rescue interventions applied to this track |
| `next-action` | Text | Yes | What should happen next for this track |
| `revision-rounds` | Integer | No | Count of implementer-reviewer revision cycles completed |
| `summary` | Text | No | Brief description of work done |
| `follow-ups` | List | No | Items deferred for later |

**State Transitions**:

```
                                    ┌──────────────────────────┐
                                    │                          │
                                    ▼                          │
[start] ──► pending ──► active ──► review ──► revision ──► review
                │                                │
                │                                ▼
                │                             merged
                │
                ├──► rescue ──► active        (re-scoped, resumed)
                │         └──► serialized     (parallelism boundaries false)
                │         └──► escalated      (developer intervention needed)
                │
                ├──► blocked                  (external dependency)
                │
                └──► abandoned                (hard budget exceeded, rescue failed)
```

**Valid states**: `pending` · `active` · `review` · `revision` · `merged` · `rescue` · `serialized` · `escalated` · `blocked` · `abandoned`

**Transition rules**:
- `pending → active`: coordinator launches track with scope and brief
- `active → review`: implementer declares deliverable ready
- `review → revision`: reviewer finds substantive issues
- `revision → review`: implementer addresses issues (counts as one revision round)
- `review → merged`: reviewer finds no substantive issues; validation passes
- `active → rescue`: soft budget exceeded with no clear progress
- `rescue → active`: re-scoped and resumed
- `rescue → serialized`: parallel execution proven unsafe; continue serially
- `rescue → escalated`: rescue cannot recover; needs developer input
- `active → blocked`: external dependency prevents progress
- `active → abandoned`: hard budget exceeded and rescue failed
- **Maximum revision rounds**: default 2 before escalation (configurable)

---

### 3. Rescue Action

A bounded coordinator intervention applied when a delegated track is slow, stalled, or mis-scoped. Rescue actions are recorded in the track's `rescue-history` field, not as standalone artifacts.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trigger` | Enum | Yes | `soft-budget-exceeded` · `no-visible-progress` · `scope-mismatch` · `validation-failure` · `conflict-detected` |
| `action` | Enum | Yes | `re-scope` · `targeted-resend` · `serialize` · `reduce-context` · `escalate-to-developer` |
| `rationale` | Text | Yes | Why this rescue was chosen |
| `outcome` | Enum | Yes | `resumed` · `serialized` · `escalated` · `abandoned` |
| `attempt-number` | Integer | Yes | Which rescue attempt this is (1-based) |

**Constraints**:
- Maximum rescue attempts per track before hard stop: **2** (configurable)
- Rescue actions must be bounded — each produces a clear next state, not an open-ended loop
- `escalate-to-developer` is terminal for the coordinator; it does not retry

---

### 4. Workflow Outcome Measure

Recorded indicators used to assess whether throughput improvements preserve quality. These are fields in the batch/session summary artifact, not standalone entities.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `discovery-reuse` | Enum | Yes | `yes` (brief created and shared) · `no` (each role discovered independently) · `skipped` (narrow task, discovery unnecessary) |
| `rescue-attempts` | Integer | Yes | Total rescue actions triggered across all tracks |
| `abandonment-events` | Integer | Yes | Tracks stopped without successful completion |
| `re-review-loops` | Map (track → count) | Yes | Revision rounds per track |
| `final-gate-result` | Enum | Conditional | `ready` · `ready-with-follow-ups` · `not-ready` · `stopped` (required when final-pr-readiness-gate invoked) |

**Recording rules**:
- Outcome measures are populated in the batch summary artifact at workflow completion (Workflow Step 7 in `parallel-implementation-loop`, Step 7 in `pr-review-resolution-loop`, Step 7 in `final-pr-readiness-gate`)
- If a workflow is interrupted before completion, record partial measures with a note explaining the interruption
- Measures are qualitative and self-reported by the coordinator; they are not enforced by tooling

---

## Relationship Diagram

```
Discovery Brief (1) ──produces──► Coordinator (1)
Coordinator (1) ──creates──► Workflow Track State (N)
Workflow Track State (1) ──contains──► Rescue Action (0..M)
Coordinator (1) ──records──► Workflow Outcome Measure (1 per batch)

Discovery Brief ──consumed-by──► Implementer (via task slice)
Discovery Brief ──consumed-by──► Reviewer (via factual brief)
```

## Template Locations

All templates will be added to `docs/workflow-artifact-templates.md` alongside the existing three templates:

| Template | Section Title | New or Updated |
|----------|--------------|----------------|
| Discovery Brief | `## Discovery brief` | New |
| Workflow Track State | `## Parallel implementation track report` | Updated (add state, rescue-history, next-action, revision-rounds) |
| Review Resolution Summary | `## Review-resolution summary` | Updated (add outcome measures) |
| Final Readiness Report | `## Final readiness report` | Updated (add outcome measures) |
| Workflow Outcome Measures | `## Workflow outcome measures` | New |
