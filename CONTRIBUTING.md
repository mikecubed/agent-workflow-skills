# Contributing

This repository is a shared plugin for **GitHub Copilot CLI** and **Claude Code**. The shared `skills/` tree is the product surface, and the manifests describe how that same skill set is exposed in each runtime.

## What to change

- Change workflow behavior in `skills/<skill-name>/SKILL.md`.
- Change plugin packaging or identity in `plugin.json`, `.claude-plugin/plugin.json`, or `.github/plugin/marketplace.json`.
- Change validation rules in `test/plugin-layout.test.js`.
- Change local/runtime verification behavior in `scripts/verify-runtime.mjs`.

## Skill authoring rules

Every shared skill must:

- live at `skills/<skill-name>/SKILL.md`;
- keep the frontmatter `name` aligned with the directory name;
- include the sections enforced by the test suite, including `## Purpose`, `## When to Use It`, `## Project-Specific Inputs`, `## Workflow`, `## Required Gates`, `## Stop Conditions`, and at least one `## Example` section.

Keep skill content repo-agnostic. These skills are meant to be reusable across repositories, so avoid hardcoding branch names, file layouts, or validation commands that only make sense here.

## Validation

Use Node 22 or newer.

Install dependencies:

```bash
npm install
```

Run the repository test suite:

```bash
npm test
```

Run the same validation through the named script:

```bash
npm run validate:plugin
```

Verify the packaged artifact surface:

```bash
npm pack --dry-run
```

Verify real CLI/plugin loading:

```bash
npm run validate:runtime
```

`validate:runtime` is intentionally opt-in rather than a CI gate. It uses authenticated local CLIs, performs an isolated Copilot install/list/uninstall check, and runs session-only plugin loading checks in both Copilot CLI and Claude Code.

## Runtime-specific manifest notes

The Copilot and Claude manifests intentionally use different `skills` path syntax:

- `plugin.json` uses `["skills/"]`;
- `.claude-plugin/plugin.json` uses `"./skills/"`.

That difference is expected and is documented in the tests and README.

## Local testing

For Copilot CLI, load the plugin directly from the repo root:

```bash
copilot -p "List the plugin-qualified skill names loaded from this plugin, one per line and nothing else." --plugin-dir . --allow-all-tools --output-format text
```

For Claude Code:

```bash
claude -p --plugin-dir . --output-format text "List the plugin-qualified skill names loaded from this plugin, one per line and nothing else."
```

To test interactively in Claude Code, run:

```bash
claude --plugin-dir .
```

Then reload changes with:

```text
/reload-plugins
```

## Opening changes

Prefer small PRs that keep one theme together:

- skill-content changes;
- test/validation changes;
- packaging/runtime changes;
- contributor-doc changes.

If you change skill structure or manifest metadata, run both `npm test` and `npm run validate:runtime` before opening the PR.

## Durable workflow artifacts

If you need a committed artifact for implementation, review-resolution, or readiness work, use the canonical templates in:

- `docs/workflow-artifact-templates.md`

Keep committed workflow artifacts under `docs/` and use descriptive names such as:

- `docs/track-report-<topic>.md`
- `docs/review-resolution-<topic>.md`
- `docs/readiness-report-<topic>.md`
