# Research: Workflow Skill Throughput and Coordination Improvements

**Date**: 2026-04-02 | **Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)

## Source Material

This research synthesizes findings from:

- **Feature spec**: `.sdd/workflow-throughput-9f2k4m1q/spec.md` — 3 user stories, 8 FRs, 4 SCs
- **Recommendations doc**: `docs/coordinator-subagent-recommendations.md` — 7 recommendations with rationale
- **Current skill files**: 3 SKILL.md files totaling ~791 lines of protocol text
- **Artifact templates**: `docs/workflow-artifact-templates.md` — 3 existing templates
- **Skills evaluation**: `docs/skills-evaluation.md` — gap analysis against best practices
- **Repository conventions**: CLAUDE.md, CONTRIBUTING.md, README.md — structural invariants

## Key Technical Decisions

### 1. Where does the scout/discovery role live?

**Problem**: The spec (FR-001) requires a bounded discovery step. The recommendations doc proposes a "scout/discovery agent" role (line 57). The question is whether this is a new skill or a phase within existing skills.

**Options evaluated**:

| Option | Pros | Cons |
|--------|------|------|
| A. New `skills/scout-discovery/` skill | Clean separation; independent lifecycle; own model selection | Breaks three-skill invariant (CLAUDE.md); requires manifest, test, packaging changes; scout never runs independently — always precedes another skill |
| B. Phase within each existing skill | Preserves three-skill architecture; no manifest/test changes; discovery is contextual to each skill's needs | Slight duplication of discovery language across skills; cannot invoke discovery independently |
| C. Shared include/partial | Single definition reused by all skills | Skills are Markdown protocols, not code modules; no include mechanism exists |

**Decision**: **Option B** — discovery as a Workflow phase in each skill.

**Rationale**: The scout is always a precursor to a specific skill's execution. It does not have its own gates, stop conditions, or independent lifecycle. Adding it as a Workflow subsection is consistent with how the skills already structure their phases. The three-skill invariant documented in CLAUDE.md ("Three-skill split preserved: implementation parallelism, review resolution, final readiness separate") is a deliberate design choice that should not be broken for an internal optimization.

### 2. How to change context-sharing rules without breaking reviewer independence?

**Problem**: `parallel-implementation-loop/SKILL.md:48` says "Do not share context between roles." `pr-review-resolution-loop/SKILL.md:40` says "Pass implementer exact fix scope and constraints. Pass reviewer only resulting diff and review criteria." These protect independence but cause expensive rediscovery.

**Options evaluated**:

| Option | Pros | Cons |
|--------|------|------|
| A. Remove restrictions entirely | Maximum sharing; fastest execution | Reviewer sees implementer rationale and may be anchored to it; violates independence principle |
| B. Share factual brief, prohibit sharing conclusions | Preserves independence; eliminates redundant file/boundary discovery; aligns with recommendations doc line 46–51 | Requires clear definition of "factual" vs. "conclusion"; coordinator must curate the brief |
| C. Keep current restrictions, rely on faster models | No protocol changes needed | Does not solve the structural problem; cheap models still waste tokens on repeated discovery |

**Decision**: **Option B** — share factual brief, prohibit sharing conclusions.

**Specific wording**: "Keep implementation and review judgment separate. The coordinator may share a factual brief that includes task boundaries, files, validation commands, and known dependencies. Do not share proposed solutions, review verdicts, or evaluative conclusions."

This wording draws a clear line: facts about the repository (file paths, test commands, dependency relationships) are shareable; opinions about the code (design quality, correctness judgments, recommended fixes) are not.

### 3. What state model for coordinator progress tracking?

**Problem**: The spec (FR-003) requires distinguishing slow-but-progressing from stuck. The current skills have stop conditions but no intermediate states between "running" and "stopped."

**Options evaluated**:

| Option | Pros | Cons |
|--------|------|------|
| A. Simple timeout (wall clock) | Easy to describe; deterministic | Cannot distinguish progress from stuck; rewards fast failure over slow success |
| B. Progress-based soft/hard budget with rescue | Matches the recommendations doc state model (lines 139–166); gives coordinator explicit decision points | More complex protocol text; "progress" is subjective in LLM context |
| C. External orchestration with heartbeats | Most robust progress detection | Requires runtime infrastructure; out of scope (persistent orchestration) |

**Decision**: **Option B** — progress-based soft/hard budget with rescue.

**State transitions**:
```
[start] → discovering → launching → waiting
waiting → waiting       (progress visible)
waiting → rescue        (soft budget exceeded, no clear progress)
rescue  → waiting       (re-scoped or resumed)
rescue  → serializing   (parallelism boundaries false)
waiting → completed     (deliverable returned)
serializing → completed
waiting → stopped       (hard budget exceeded and rescue failed)
```

**Progress indicators** (for LLM-based assessment): files being modified, tests being added, validation being run, partial results returned, tool calls succeeding. These are described qualitatively in the skill text, not as numeric thresholds.

### 4. How to make artifacts required without adding runtime enforcement?

**Problem**: FR-005 uses "MUST require" language for durable artifacts. But skills are Markdown protocols consumed by LLM runtimes — there is no code-level enforcement mechanism.

**Options evaluated**:

| Option | Pros | Cons |
|--------|------|------|
| A. Advisory language ("should produce artifacts") | Lowest friction; current approach | Does not satisfy "MUST" in FR-005; easy to skip |
| B. Gate language ("artifact MUST be produced before gate passes") | Strong protocol signal; LLM coordinators treat gates as blocking; consistent with existing Required Gates pattern | No runtime enforcement; depends on LLM compliance with protocol |
| C. Tooling enforcement (script checks for artifact files) | Deterministic enforcement | Skills are repo-agnostic; cannot hardcode artifact paths; would need custom per-repo tooling |

**Decision**: **Option B** — artifact production as a gate requirement.

**Rationale**: The existing skills already use Required Gates as their strongest enforcement mechanism. Adding artifact production to the gate checklist is the most natural and consistent approach. LLM runtimes that consume these protocols treat gate language as blocking. This is the same enforcement level as existing requirements like "tests added first" and "validation passes."

### 5. How to define convergence without adding persistent orchestration?

**Problem**: FR-006 requires convergence and disagreement rules. The recommendations doc (lines 196–206) proposes escalation rules. The risk is that convergence mechanisms drift into persistent multi-turn orchestration.

**Decision**: Bounded rules embedded in skill protocol text:

1. **Same issue twice**: If reviewer raises the same issue after one revision, escalate to coordinator (not back to implementer). Coordinator decides: developer escalation, re-scope, or accept with documented rationale.
2. **Scope growth**: If a fix grows beyond its original scope boundary, stop and re-scope before continuing. Do not allow creeping implementation.
3. **Material disagreement**: If implementer and reviewer disagree on a substantive issue after one exchange, escalate to developer for tie-breaking. Do not loop.
4. **Maximum revision rounds**: Default to 2 revision rounds per track before escalation. Configurable in project-specific inputs.

These are simple, bounded rules that operate within a single skill execution. They do not require persistent state across sessions.

### 6. What outcome measures are recordable without telemetry?

**Problem**: FR-007 requires outcome measures. The recommendations doc (lines 209–219) lists six metrics. Skills run in LLM runtimes without telemetry pipelines.

**Decision**: Record five measures as fields in the batch/session summary artifact:

| Measure | Recording Method | Type |
|---------|-----------------|------|
| Discovery reuse | `yes` / `no` / `skipped` (with reason) | Categorical |
| Rescue attempts | Count of rescue actions triggered during execution | Integer |
| Abandonment events | Count of tracks stopped without successful completion | Integer |
| Re-review loops per track | Count of revision rounds per track | Integer per track |
| Final gate result | `ready` / `ready-with-follow-ups` / `not-ready` / `stopped` | Categorical |

The sixth metric from the recommendations doc (subagent completion time) is not reliably measurable in all LLM runtimes and is omitted. If runtime tooling supports timing, it can be added as an optional field.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LLM runtimes ignore new protocol text | Medium | High | Use gate language (strongest enforcement signal); validate with manual testing |
| Discovery phase adds latency for narrow tasks | Low | Medium | Include explicit skip condition: "Skip discovery when the task is narrow and fully scoped" |
| Rescue policy creates runaway loops | Low | High | Hard budget acts as absolute stop; rescue limited to one attempt before serialization or developer escalation |
| Artifact requirements slow simple workflows | Low | Low | Artifacts are lightweight Markdown; narrow tasks produce minimal artifacts |
| Convergence rules are too rigid for edge cases | Medium | Low | Rules are defaults with "configurable in project-specific inputs" escape hatch |

## References

- Feature spec: `.sdd/workflow-throughput-9f2k4m1q/spec.md`
- Recommendations: `docs/coordinator-subagent-recommendations.md`
- Current skills: `skills/*/SKILL.md`
- Artifact templates: `docs/workflow-artifact-templates.md`
- Skills evaluation: `docs/skills-evaluation.md`
- Repository conventions: `CLAUDE.md`, `CONTRIBUTING.md`
