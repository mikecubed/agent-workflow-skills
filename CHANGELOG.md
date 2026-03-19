# Changelog

All notable changes to this plugin should be documented in this file.

The format is based on Keep a Changelog and the project follows Semantic Versioning.

## [Unreleased]

### Added

- `CONTRIBUTING.md` with repo-specific contributor guidance
- `CLAUDE.md` with Claude Code specific repository instructions
- `docs/workflow-artifact-templates.md` with canonical templates for track reports, review-resolution summaries, and readiness reports
- `scripts/verify-runtime.mjs` and `npm run validate:runtime` for isolated Copilot install/list/uninstall and real plugin loading checks in both Copilot CLI and Claude Code
- stronger test coverage for manifest sync, required skill sections, and packaged artifact contents

### Changed

- strengthened the shared skill docs with examples, stop conditions, stronger TDD language, and clearer recovery guidance
- expanded `README.md` and `.github/copilot-instructions.md` with validation and runtime-verification guidance
- updated `docs/skills-evaluation.md` to track completed and remaining recommendations

## [0.1.0] - 2026-03-18

### Added

- initial shared plugin structure for GitHub Copilot CLI and Claude Code
- shared `skills/` tree with:
  - `parallel-implementation-loop`
  - `pr-review-resolution-loop`
  - `final-pr-readiness-gate`
- Copilot manifest, Claude manifest, marketplace metadata, and validation workflow
