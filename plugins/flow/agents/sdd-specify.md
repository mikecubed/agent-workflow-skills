---
description: "Create a feature specification from a natural language description."
handoffs:
  - label: Create Implementation Plan
    agent: sdd-plan
    prompt: Create a plan for this spec
    send: true
  - label: Iterate on Spec
    agent: sdd-specify
    prompt: Refine the specification in the current .sdd/{feature-dir} workspace
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Flow Agent Contract

This is a Copilot agent in the `flow` plugin, not a standalone command plugin.
Keep handoffs and references in `flow` form (`sdd-plan`, `sdd-specify`, and
`/flow:sdd-*`) and write all artifacts under the repository-local `.sdd/`
workspace.

## Outline

Given the feature description in `$ARGUMENTS`, do this:

1. **Check for headless mode**: If `$ARGUMENTS` contains `headless` or `--headless`, enable headless mode — auto-accept all recommended defaults and complete without pausing for user input.

2. **Resolve the feature workspace**:
   - If `$ARGUMENTS` names an existing `.sdd/{feature-dir}/` directory, use that directory.
   - If the handoff context names the current `.sdd/{feature-dir}` workspace, use that directory.
   - If this is an `Iterate on Spec` handoff, locate the existing `.sdd/{feature-dir}/spec.md` and update it in place.
   - Load the existing `spec.md` before editing so refinement preserves prior user stories, requirements, clarification decisions, and success criteria.
   - When updating an existing spec, preserve the existing `plan.md` / `tasks.md` chain by keeping the same feature directory and noting any downstream artifacts that may need regeneration.
   - Only create a new feature directory when no existing workspace is identified.

3. **Generate a feature directory name for new specifications only**:
   - Derive a short 2-4 word slug from the feature description (e.g., "user-auth", "analytics-dashboard")
   - Append an 8-character random alphanumeric suffix (e.g., `user-auth-a3f9b2c1`)
   - Full path: `.sdd/{slug}-{suffix}/`

4. **Create the feature directory** and all required parent directories when this is a new specification.

5. **Use the canonical specification template embedded below**:
   ````md
# Feature Specification: [FEATURE NAME]

**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

### Edge Cases

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability]
- **FR-002**: System MUST [specific capability]
- **FR-003**: Users MUST be able to [key interaction]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable metric]
- **SC-002**: [Measurable metric]
- **SC-003**: [User satisfaction metric]
````

6. **Generate or refine the specification** by filling the template:
   - Replace `[FEATURE NAME]` with a human-readable feature name
   - Replace `[DATE]` with today's date
   - Fill in user stories (at least 2), functional requirements, and success criteria
   - Mark genuinely unclear decisions as `[NEEDS CLARIFICATION: specific question]` — maximum 3 markers
   - When refining, update only the sections implicated by the user request and preserve stable requirement IDs unless the change intentionally supersedes them

7. **Write** the filled specification to `.sdd/{feature-dir}/spec.md`.

8. **Quality validation** — validate the spec:
   - No implementation details
   - All mandatory sections completed
   - Requirements are testable and success criteria are measurable

9. **Handle clarifications** (skip in headless mode — auto-resolve with defaults).

10. **Write quality checklist** to `.sdd/{feature-dir}/checklists/requirements.md`.

11. **Report completion** with feature directory path, spec file path, checklist summary, and whether this was a new spec or an in-place refinement.
