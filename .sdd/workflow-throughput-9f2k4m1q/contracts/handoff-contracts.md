# Interface Contracts: Workflow Handoff Contracts

**Date**: 2026-04-02 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

## Purpose

These contracts define the bounded, structured handoffs between roles inside the existing workflow skills. They are intentionally **not** open-ended chat contracts and do not introduce persistent team orchestration.

## Contract 1: Scout to Coordinator

**Artifact**: Discovery Brief

**Required fields**:

- task summary
- task shape
- relevant files
- task boundaries
- validation commands
- dependencies when relevant
- comparison baseline when relevant
- open questions
- skip reason when discovery is skipped

**Contract rule**: This handoff may contain repository facts and task-shaping information only. It must not contain code-quality judgments or suggested reviewer conclusions.

## Contract 2: Coordinator to Implementer

**Artifact**: Task Slice

**Required fields**:

- track name
- task or item IDs
- scoped files
- factual brief excerpt
- validation command
- scope boundary
- applicable workflow constraints
- next expected deliverable

**Contract rule**: The coordinator defines scope. The implementer should not renegotiate scope through open-ended discussion; it should either execute, report uncertainty, or trigger a bounded rescue path.

## Contract 3: Implementer to Reviewer

**Artifact**: Track Report plus Diff

**Required fields**:

- files changed
- tests added or updated
- validation performed and result
- unresolved uncertainties
- next requested reviewer action

**Contract rule**: The implementer may describe what changed, but must not tell the reviewer what verdict to reach.

## Contract 4: Reviewer to Coordinator

**Artifact**: Findings

**Required fields**:

- issue identifier
- severity
- affected files
- exact concern
- recommended next action
- whether resend is required

**Contract rule**: Findings must be substantive and action-oriented. Style-only or open-ended conversational feedback does not satisfy this contract.

## Contract 5: Coordinator to Implementer Resend

**Artifact**: Targeted Resend

**Required fields**:

- unresolved issue IDs
- constrained scope
- acceptance criteria for the resend
- validation to rerun
- escalation condition if the issue repeats

**Contract rule**: A resend is bounded follow-up work. It is not a restart of the full task and not an invitation to broaden scope.

## Contract 6: Workflow Completion Handoff

**Artifact**: Durable Workflow Summary

**Required fields**:

- final state per track
- unresolved work
- next action
- outcome measures
- explicit note that persistent team or fleet orchestration was out of scope for this feature

**Contract rule**: The durable summary must survive the active exchange in a repository-appropriate sink. It does not have to be a committed Markdown file in every repository.
