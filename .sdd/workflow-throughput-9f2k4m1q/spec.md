# Feature Specification: Workflow Skill Throughput and Coordination Improvements

**Created**: 2026-04-02
**Status**: Draft
**Input**: User description: "Create a spec/plan for the recommendations to improve coordinator/subagent throughput and reliability while keeping teams/squad skills out of scope."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Faster bounded workflow execution (Priority: P1)

As a developer using the workflow skills, I want the coordinator to prepare and reuse the right context once so that expensive subagents do not repeatedly rediscover the same repository facts and the workflow finishes faster.

**Why this priority**: Reducing repeated discovery is the highest-leverage improvement because it directly cuts latency, token spend, and the chance that the coordinator abandons subagents too early.

**Independent Test**: Invoke a bounded workflow on a task with multiple tracks and confirm that the workflow uses one shared factual brief rather than making each specialist rediscover the same files, boundaries, and validation commands.

**Acceptance Scenarios**:

1. **Given** a bounded multi-track workflow with incomplete shared context, **When** the workflow starts, **Then** it creates or reuses one discovery artifact that captures task boundaries, relevant files, and validation expectations for the batch.
2. **Given** a workflow with multiple specialist agents, **When** the coordinator delegates work, **Then** each specialist receives the relevant factual brief for its scope without needing to rediscover the same repository facts from scratch.

---

### User Story 2 - Better coordination of slow or stalled subagents (Priority: P2)

As a developer using the workflow skills, I want the coordinator to distinguish between a subagent that is still making progress and one that is actually stuck so that it can rescue or re-scope work before giving up.

**Why this priority**: The current user pain is not only slowness but premature abandonment. A better coordination policy preserves quality while improving completion rates.

**Independent Test**: Run a bounded workflow where one subagent is slow or needs a second pass and confirm that the coordinator uses a rescue or resend path before stopping the workflow.

**Acceptance Scenarios**:

1. **Given** a delegated task that exceeds an initial waiting budget, **When** the subagent still shows meaningful progress, **Then** the coordinator continues the workflow instead of abandoning the task immediately.
2. **Given** a delegated task that is stalled or mis-scoped, **When** the coordinator detects the issue, **Then** it triggers a bounded rescue action such as re-scoping, targeted resend, or serialization before declaring the workflow blocked.

---

### User Story 3 - Durable, auditable workflow handoffs (Priority: P3)

As a maintainer of the workflow skills, I want the workflows to leave durable artifacts and measurable outcomes so that results can be resumed, reviewed, and improved over time without relying on chat history.

**Why this priority**: Durable handoffs and metrics reduce rediscovery, improve resumability, and make it possible to judge whether throughput changes preserved quality.

**Independent Test**: Execute a bounded workflow and confirm that it creates or updates workflow artifacts and records enough information to understand progress, decisions, and remaining work in a later session.

**Acceptance Scenarios**:

1. **Given** a workflow that delegates work across roles, **When** a track changes state, **Then** the workflow updates a durable artifact with ownership, status, validation, and next action.
2. **Given** a completed workflow iteration, **When** a maintainer reviews the output, **Then** they can identify whether discovery reuse, rescue behavior, and quality gates worked without reconstructing the session from chat alone.

### Edge Cases

- What happens when discovery is unnecessary because the task is already narrow and fully scoped?
- How does the workflow handle a reviewer and implementer disagreeing repeatedly on the same issue?
- What happens when a rescue attempt confirms that the task cannot be safely parallelized?
- How does the workflow behave when artifact updates succeed but a delegated track remains blocked?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add a bounded discovery step for applicable workflow executions that produces a reusable factual brief for the current batch or session.
- **FR-002**: System MUST allow the coordinator to share factual workflow context across roles while preserving independent implementation and review judgment.
- **FR-003**: System MUST define coordinator behavior for slow, stalled, or mis-scoped delegated work, including continued waiting when progress is visible and bounded rescue actions before abandonment.
- **FR-004**: System MUST support bounded resend loops for targeted follow-up work between coordinator and specialists without turning the workflow into open-ended agent conversation.
- **FR-005**: System MUST require durable workflow artifacts for delegated work so later sessions can understand status, decisions, and next actions.
- **FR-006**: System MUST define convergence and disagreement rules for repeated implementer-reviewer cycles.
- **FR-007**: System MUST define a small set of workflow-level outcome measures that indicate whether throughput improvements preserve quality.
- **FR-008**: System MUST keep persistent team, squad, or long-lived orchestration features out of scope for this feature.

### Key Entities *(include if feature involves data)*

- **Discovery Brief**: A reusable factual summary for a bounded workflow execution that captures task boundaries, relevant files, validation expectations, dependencies, and open questions.
- **Workflow Track State**: A durable record of one delegated unit of work, including owner role, current status, validation outcome, unresolved issues, and next action.
- **Rescue Action**: A bounded coordinator intervention used when delegated work is slow, stalled, or mis-scoped, such as re-scoping, targeted resend, or serialization.
- **Workflow Outcome Measure**: A recorded indicator used to assess whether the workflow reduced abandonment and repeated discovery while preserving quality.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In bounded workflows with multiple delegated tracks, the workflow creates or reuses one discovery brief per batch or session in at least 90% of applicable runs.
- **SC-002**: In bounded workflows where a delegated task exceeds an initial waiting budget, the coordinator attempts a documented rescue action before abandonment in 100% of applicable runs.
- **SC-003**: Every completed bounded workflow produces durable artifact updates that identify current status, unresolved work, and next action for each delegated track.
- **SC-004**: The updated workflows explicitly exclude persistent team or squad-style orchestration from scope in all affected documentation and planning artifacts.
