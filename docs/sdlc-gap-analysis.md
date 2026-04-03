# SDLC Gap Analysis

Where `agent-orchestration` sits today in the full modern software development lifecycle — what is covered, what is missing, why it matters, and where to go next.

---

## Current Coverage Snapshot

Three plugins, 21 skills/sub-skills, covering roughly the middle third of the SDLC:

```mermaid
graph TD
    subgraph COVERED["✅ Covered Today"]
        direction LR
        C1["sdd-workflow\nspecify · plan · tasks"]
        C2["workflow-orchestration\nplanning · parallel-impl · swarm\npr-review · readiness-gate"]
        C3["clean-code-codex\ntdd · arch · type · naming · size\ndead · test · sec · dep · obs"]
    end

    subgraph PARTIAL["🟡 Partial Coverage"]
        direction LR
        P1["Security\n7 code-level rules only\nno IaC · no supply chain · no SBOM"]
        P2["Testing\nunit/TDD gates only\nno E2E · no perf · no contract"]
        P3["Observability\npattern enforcement only\nno instrumentation generation"]
    end

    subgraph MISSING["🔴 Not Covered"]
        direction LR
        M1["Ideation / Brainstorming"]
        M2["Architecture Design\npre-implementation"]
        M3["Documentation Generation"]
        M4["CI/CD / Deployment"]
        M5["Incident Response / RCA"]
        M6["Developer Onboarding / DX"]
        M7["Refactoring Automation"]
        M8["Performance Testing"]
    end
```

---

## Full SDLC Coverage Heatmap

Each cell shows: **our coverage level** for that phase.

```mermaid
quadrantChart
    title Coverage Depth vs Phase Importance
    x-axis "Lower dev frequency" --> "Daily developer touchpoint"
    y-axis "Nice to have" --> "Critical for quality"
    quadrant-1 "High value · High use"
    quadrant-2 "High value · Lower use"
    quadrant-3 "Lower value · Lower use"
    quadrant-4 "Lower value · High use"
    Code Quality: [0.85, 0.92]
    PR Workflow: [0.80, 0.88]
    Spec/Planning: [0.55, 0.80]
    Security: [0.40, 0.95]
    Implementation: [0.85, 0.85]
    Testing: [0.75, 0.90]
    Documentation: [0.10, 0.70]
    CI/CD: [0.50, 0.85]
    Observability: [0.35, 0.88]
    Ideation: [0.20, 0.65]
    Onboarding: [0.10, 0.60]
    Incident Response: [0.15, 0.82]
    Refactoring: [0.30, 0.78]
    Performance: [0.05, 0.80]
    Architecture Design: [0.25, 0.85]
```

> **How to read:** Items in the top-right quadrant are **high-value daily touchpoints we don't fully cover** — the biggest gaps.

---

## Phase-by-Phase Gap Analysis

### 1 — Discovery / Ideation

| | |
|---|---|
| **Covered** | Nothing |
| **Missing** | Socratic design questioning, problem/opportunity validation, stakeholder interview structuring, competitive framing |
| **Priority** | 🟠 High |

**Why it matters:** 30–40% of scope drift starts here — solving the wrong problem. A Socratic ideation skill that challenges assumptions, surfaces constraints, and forces alternatives *before* the spec is written would prevent expensive mid-course corrections. It's the cheapest place to catch a bad idea.

---

### 2 — Requirements / Specification

| | |
|---|---|
| **Covered** | `sdd.specify` → formal spec + requirements checklist |
| **Missing** | Non-functional requirements (NFRs), BDD/Gherkin acceptance criteria, API contract specs (OpenAPI), compliance extraction (GDPR, PCI, HIPAA), risk/assumption registries |
| **Priority** | 🔴 Critical |

**Why it matters:** Well-written features still often lack NFRs and structured acceptance criteria, leading to misaligned implementations. Auto-generating OpenAPI specs and BDD scenarios from `sdd.specify` output would prevent interface drift. For regulated industries, auto-extracting compliance requirements would shift legal review earlier and cheaper.

---

### 3 — Architecture / Design

| | |
|---|---|
| **Covered** | `arch-check` enforces violations *after* code is written; `planning-orchestration` does codebase discovery |
| **Missing** | Upfront ADR generation, design pattern selection, interface contract definition, sequence diagram generation, technology trade-off analysis, schema/data model design |
| **Priority** | 🟠 High |

**Why it matters:** Architecture decisions made implicitly during implementation are expensive to reverse. A pre-implementation design review skill — with domain agents for performance, security, and maintainability — would catch structural problems at the lowest possible cost. `arch-check` is a rear-view mirror; we need a windshield.

---

### 4 — Implementation

| | |
|---|---|
| **Covered** | `parallel-implementation-loop`, `tdd-check`, `type-check`, `naming-check`, `size-check`, auto-hooks (SEC-1, ARCH-1, SIZE-1) |
| **Missing** | Boilerplate/scaffold generation from specs, refactoring automation (extract method, rename), accessibility (a11y/WCAG) checks, i18n setup, resilience pattern scaffolding (retry, circuit breaker, backoff) |
| **Priority** | 🟡 Medium |

**Why it matters:** AI writes code faster than humans but still produces boilerplate inconsistently. A skill that generates CRUD layers, middleware stacks, or ORM queries from an OpenAPI spec would 10x implementation velocity. Accessibility and resilience patterns are always added "later" — enforcing them at write time makes them free.

---

### 5 — Testing

| | |
|---|---|
| **Covered** | `tdd-check` (TDD-1–9), `test-check` (TEST-1–8), TEST-DELTA hook, `sec-check` for security patterns |
| **Missing** | E2E test generation (Cypress/Playwright from specs), integration/contract testing, performance/load tests, chaos/resilience tests, mutation testing, test data generation, visual regression |
| **Priority** | 🔴 Critical |

**Why it matters:** AI-generated code includes unit tests but systematically skips integration, performance, and security tests. Auto-generating E2E tests from feature specs, consumer-driven contract tests, and OWASP attack-vector tests would catch an entire class of bugs that unit tests miss. Performance tests written *at feature time* (not as an afterthought) prevent production surprises.

---

### 6 — Code Quality / Review

| | |
|---|---|
| **Covered** | `pr-review-resolution-loop`, `final-pr-readiness-gate`, full `clean-code-codex` suite (65 rules), auto-hooks |
| **Missing** | Cyclomatic/cognitive complexity scoring, duplication/clone detection, API doc completeness (JSDoc/Javadoc), code smell detection beyond the 65 rules, git churn analysis |
| **Priority** | 🟡 Medium (strong baseline; targeted gaps only) |

**Why it matters:** Review feedback is often subjective. Adding quantitative complexity scoring and duplication detection would make review verdicts objective and actionable. API documentation completeness is a chronic DX gap — auto-enforcing it would improve library adoption and reduce support friction.

---

### 7 — Security

| | |
|---|---|
| **Covered** | `sec-check` (SEC-1–7): secrets, injection, auth, TLS, crypto, token handling, bash injection hook |
| **Missing** | IaC security scanning (Terraform/CloudFormation vs CIS benchmarks), container/image scanning, SBOM generation, supply chain provenance, PII/data classification, IAM policy validation, cryptographic agility |
| **Priority** | 🔴 Critical |

**Why it matters:** The 7 sec-check rules cover the most egregious code-level patterns but the attack surface extends far beyond code. Cloud misconfigurations (exposed S3, over-permissive IAM) cause more breaches than SQL injection today. Auto-validating Terraform against CIS benchmarks and generating SBOMs would cover the infrastructure layer that sec-check can't touch.

---

### 8 — Documentation

| | |
|---|---|
| **Covered** | Nothing dedicated — sdd artifacts are specs, not user-facing or operational docs |
| **Missing** | README generation, API docs (OpenAPI → rendered), ADR generation, runbook generation, onboarding guides, changelog from git history, diagram generation (C4/ER), dead-doc detection |
| **Priority** | 🟠 High |

**Why it matters:** Documentation is always last written and first outdated. A skill that auto-generates API docs from signatures, ADRs from design decisions, and runbooks from config files keeps docs in sync with code at zero marginal effort. Dead-doc detection removes misinformation that misleads future contributors.

---

### 9 — CI/CD / Release / Deployment

| | |
|---|---|
| **Covered** | Nothing |
| **Missing** | Pipeline scaffold generation (GitHub Actions, GitLab CI), release management (semver, tag, changelog), deployment orchestration (K8s manifests, Helm, Terraform), build optimization, IaC drift detection, feature flags, rollback automation |
| **Priority** | 🟠 High |

**Why it matters:** AI builds code but doesn't wire it to production. A skill that generates a complete GitHub Actions pipeline from project config (language, test commands, deploy target) would reduce "works on my machine" failures. Kubernetes manifest generation with correct resource limits and health probes would prevent common deploy-time outages.

---

### 10 — Observability / Monitoring

| | |
|---|---|
| **Covered** | `obs-check` (OBS-1–5): empty catches, logging patterns, error context, health check presence; OBS-1 auto-hook |
| **Missing** | Instrumentation generation (structured logs, OpenTelemetry spans, Prometheus metrics), SLO/SLI definition, alert rule generation, distributed tracing setup, cost monitoring, APM integration |
| **Priority** | 🟠 High |

**Why it matters:** `obs-check` flags missing observability but can't add it. A skill that auto-generates structured logging calls, OpenTelemetry spans, and Prometheus metric definitions would ship code with "observability by default." SLO/SLI generation from requirements would align monitoring with business expectations from day one.

---

### 11 — Incident Response / Debugging

| | |
|---|---|
| **Covered** | `sec-check` + `obs-check` trigger on incident; `final-pr-readiness-gate` catches pre-release risks |
| **Missing** | Structured debugging workflow (hypothesis-driven), RCA methodology (blameless postmortem), incident timeline reconstruction, runbook generation, chaos engineering, circuit breaker validation, MTTR reduction |
| **Priority** | 🟠 High |

**Why it matters:** When production breaks, developers need rapid structured diagnosis. A skill that walks through hypothesis → test → observe, reconstructs timelines from logs, and generates blameless RCA templates would compress MTTR by 50% and prevent recurrence. Chaos experiment generation would validate resilience *before* the incident.

---

### 12 — Dependency Management

| | |
|---|---|
| **Covered** | `dep-check` (DEP-1–5): CVEs, version lag, misclassified deps, unpinned versions; DEP-1 auto-hook |
| **Missing** | Upgrade automation (major/minor/patch strategies), transitive CVE fixup, lock file validation, supply chain security, license compliance scanning, SPDX SBOM generation, bundle size impact analysis |
| **Priority** | 🟡 Medium (good baseline; automation layer missing) |

**Why it matters:** `dep-check` identifies problems but can't fix them. A skill that auto-generates upgrade PRs with test validation, batches minor/patch security updates, and flags transitive CVEs would reduce security debt from weeks to hours. License compliance automation would prevent legal exposure in open-source usage.

---

### 13 — Onboarding / Developer Experience

| | |
|---|---|
| **Covered** | Nothing |
| **Missing** | Getting-started guide generation, dev environment setup automation (devcontainers, Docker Compose), codebase architecture tour, common task runbooks, contribution guidelines, IDE config generation |
| **Priority** | 🟡 Medium |

**Why it matters:** Onboarding friction compounds — every new contributor who spends days setting up is wasted productivity. A skill that auto-generates getting-started guides, devcontainer configs, and architecture tours from codebase metadata would reduce time-to-first-commit from days to hours. For distributed teams, standardized IDE configs would eliminate "works on my machine" debates.

---

### 14 — Refactoring / Technical Debt

| | |
|---|---|
| **Covered** | `size-check` warns, `dead-check` warns, `naming-check` warns, `arch-check` warns — all on refactor; `tdd-check` gates |
| **Missing** | Automated refactoring (extract method, rename, move class), tech debt quantification (SQALE scoring), complexity reduction suggestions, legacy code modernization, flaky test fixes, performance profiling |
| **Priority** | 🟡 Medium |

**Why it matters:** The codex suite diagnoses tech debt well but can't remediate it. A skill that auto-applies safe refactorings (extract function, rename, inline) and tracks a debt registry would prevent codebase decay. SQALE scoring would let teams prioritize debt paydown by business impact rather than gut feeling.

---

## Gap Heatmap — Impact vs Effort

```mermaid
graph TD
    subgraph CRITICAL["🔴 Critical — Build First"]
        direction LR
        R1["OpenAPI / Contract Generation\nHigh impact · Medium effort"]
        R2["E2E Test Generation\nHigh impact · Medium effort"]
        R3["IaC Security Validation\nHigh impact · Medium effort"]
        R4["Incident RCA Skill\nHigh impact · Low effort"]
    end

    subgraph HIGH["🟠 High Value — Build Next"]
        direction LR
        O1["Ideation / Brainstorming Skill\nMedium effort"]
        O2["Documentation Generation\nMedium effort"]
        O3["CI/CD Pipeline Scaffold\nHigh effort"]
        O4["Observability Instrumentation\nMedium effort"]
        O5["Architecture Design Review\nMedium effort"]
    end

    subgraph STRATEGIC["🟡 Strategic — Differentiation"]
        direction LR
        S1["SBOM + Supply Chain\nCompliance layer"]
        S2["Performance Testing\nLoad test generation"]
        S3["Refactoring Automation\nAuto-extract-method etc"]
        S4["Accessibility Checker\nWCAG enforcement"]
        S5["Developer Onboarding\nAuto-generated guides"]
    end

    style CRITICAL fill:#3d0f0f,color:#fff
    style HIGH fill:#3d2000,color:#fff
    style STRATEGIC fill:#1a2c3d,color:#fff
```

---

## Proposed New Checks for clean-code-codex

The codex architecture (conductor + sub-skills) is the natural home for new enforcement checks. Each of these is a discrete add:

```mermaid
graph LR
    Conductor["conductor\nexisting"]

    Conductor --> A11Y["a11y-check\nWCAG · aria · alt text\nsemantic HTML"]
    Conductor --> PERF["perf-check\nN+1 queries · O(n²) loops\nmemory leaks · blocking I/O"]
    Conductor --> IaC["iac-check\nTerraform · CloudFormation\nCIS benchmarks · least-privilege"]
    Conductor --> I18N["i18n-check\nhardcoded strings · locale coverage\ncurrency/date formatting"]
    Conductor --> DOCS["docs-check\nJSDoc/docstring coverage\nstale inline comments\nREADME presence"]
    Conductor --> RESILIENCE["resilience-check\nmissing retry / backoff\nno circuit breaker\nunbounded timeouts"]

    style A11Y fill:#1a3a5c,color:#fff
    style PERF fill:#1a3a5c,color:#fff
    style IaC fill:#3d0f0f,color:#fff
    style I18N fill:#1a3a5c,color:#fff
    style DOCS fill:#1a5c2a,color:#fff
    style RESILIENCE fill:#3d2000,color:#fff
```

---

## Proposed New workflow-orchestration Skills

These are coordination-level skills, not rules — they belong in `workflow-orchestration`:

```mermaid
graph LR
    WO["workflow-orchestration\nexisting skills"]

    WO --> IDEATION["ideation-facilitation\nSocratic design · problem validation\nstakeholder interview structuring"]
    WO --> ADR["architecture-review\npre-implementation ADRs\ndesign pattern validation\ntrade-off analysis"]
    WO --> RCA["incident-rca\nblameless postmortem workflow\ntimeline reconstruction\nremediation tracking"]
    WO --> RELEASE["release-orchestration\nsemver calculation · changelog\ntag + pipeline trigger"]

    style IDEATION fill:#1a3a5c,color:#fff
    style ADR fill:#3d2000,color:#fff
    style RCA fill:#3d0f0f,color:#fff
    style RELEASE fill:#1a5c2a,color:#fff
```

---

## Proposed New Standalone Plugin — `dev-toolkit`

Some capabilities don't fit the existing plugin shapes and warrant a fourth plugin:

```mermaid
graph TD
    DT["dev-toolkit\n(proposed new plugin)"]

    DT --> DOCS2["docs-generator\nREADME · API docs · ADRs · runbooks\nchangelog · architecture tours"]
    DT --> CONTRACT["contract-generator\nOpenAPI 3.0 from spec\nconsumer-driven contract tests\nJSON Schema validation"]
    DT --> CICD["cicd-scaffold\nGitHub Actions · GitLab CI\nK8s manifests · Helm charts\nTerraform modules"]
    DT --> ONBOARD["onboard-generator\ndevcontainer · Docker Compose\nIDE config · getting-started guide"]
    DT --> SBOM["supply-chain\nSBOM generation · SPDX\nbuild provenance · sigstore"]

    style DOCS2 fill:#1a5c2a,color:#fff
    style CONTRACT fill:#3d0f0f,color:#fff
    style CICD fill:#3d2000,color:#fff
    style ONBOARD fill:#1a3a5c,color:#fff
    style SBOM fill:#1a3a5c,color:#fff
```

---

## Proposed Roadmap — Version Milestones

```mermaid
graph LR
    V06["v0.6.0\ntoday\n5 WO skills\n65 Codex rules\n3 SDD agents"]

    V07["v0.7.0\nQuick wins\n+ incident-rca skill\n+ docs-check sub-skill\n+ resilience-check sub-skill\n+ brainstorming guidance in ideation"]

    V08["v0.8.0\nContract layer\n+ contract-generator\n+ OpenAPI from spec\n+ E2E test generation\n+ architecture-review skill"]

    V09["v0.9.0\nSecurity hardening\n+ iac-check sub-skill\n+ a11y-check sub-skill\n+ perf-check sub-skill\n+ SBOM/supply-chain"]

    V10["v1.0.0\nFull SDLC\n+ cicd-scaffold\n+ onboard-generator\n+ release-orchestration skill\n+ observability instrumentation\n+ dev-toolkit plugin GA"]

    V06 --> V07 --> V08 --> V09 --> V10

    style V06 fill:#1a5c2a,color:#fff
    style V07 fill:#3d2000,color:#fff
    style V08 fill:#3d0f0f,color:#fff
    style V09 fill:#1a3a5c,color:#fff
    style V10 fill:#4a0f4a,color:#fff
```

---

## What This Unlocks at v1.0.0

```mermaid
flowchart TD
    IDEA(["💡 Idea"]) --> IDEATION["ideation-facilitation\nproblem validation · constraints · alternatives"]
    IDEATION --> SPEC["sdd.specify\nformal spec + NFRs + compliance flags"]
    SPEC --> CONTRACT["contract-generator\nOpenAPI · JSON Schema · BDD scenarios"]
    CONTRACT --> PLAN["sdd.plan + architecture-review\nADRs · design pattern validation"]
    PLAN --> IMPL["parallel-implementation-loop / swarm-orchestration\nTDD-gated · codex-enforced"]
    IMPL --> TEST["E2E test generation\ncontract tests · perf tests · a11y"]
    TEST --> REVIEW["pr-review-resolution-loop\nfinal-pr-readiness-gate"]
    REVIEW --> RELEASE["release-orchestration\nsemver · changelog · tag · pipeline"]
    RELEASE --> DEPLOY["cicd-scaffold\nGitHub Actions · K8s · Helm"]
    DEPLOY --> OBS["observability instrumentation\nstructured logs · spans · metrics · SLOs"]
    OBS --> INCIDENT["incident-rca\nblameless postmortem · remediation tracking"]
    INCIDENT --> IDEA

    style IMPL fill:#1a5c2a,color:#fff
    style REVIEW fill:#1a5c2a,color:#fff
    style OBS fill:#1a3a5c,color:#fff
    style INCIDENT fill:#3d0f0f,color:#fff
```

---

## Summary Table

| SDLC Phase | Current Coverage | Gap Severity | Proposed Solution |
|---|---|---|---|
| Discovery / Ideation | ❌ None | 🟠 High | `ideation-facilitation` skill |
| Requirements / Spec | ✅ `sdd.specify` | 🔴 Critical (NFRs, contracts) | `contract-generator` plugin |
| Architecture / Design | 🟡 Post-hoc only | 🟠 High | `architecture-review` skill |
| Implementation | ✅ Strong | 🟡 Medium (scaffolding, a11y) | `a11y-check`, `resilience-check` |
| Testing | 🟡 Unit/TDD only | 🔴 Critical (E2E, perf, contract) | E2E generator, `perf-check` |
| Code Quality | ✅ Strong (65 rules) | 🟡 Low (complexity, docs) | `docs-check`, complexity scoring |
| Security | 🟡 Code-level only | 🔴 Critical (IaC, supply chain) | `iac-check`, SBOM, `supply-chain` |
| Documentation | ❌ None | 🟠 High | `docs-generator` plugin |
| CI/CD / Deployment | ❌ None | 🟠 High | `cicd-scaffold`, `release-orchestration` |
| Observability | 🟡 Validation only | 🟠 High | Instrumentation generation |
| Incident Response | 🟡 Reactive only | 🟠 High | `incident-rca` skill |
| Dependency Mgmt | ✅ `dep-check` | 🟡 Medium (automation) | Upgrade automation |
| Onboarding / DX | ❌ None | 🟡 Medium | `onboard-generator` plugin |
| Refactoring / Debt | 🟡 Diagnosis only | 🟡 Medium | Automated refactoring |
| Performance | ❌ None | 🔴 Critical | `perf-check`, load test generation |
