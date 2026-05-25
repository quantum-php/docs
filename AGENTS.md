# Repository Guidelines

## Project Structure & Module Organization
This repository contains Markdown documentation for Quantum PHP Framework v3.0.

- `README.md`: high-level introduction and contribution entry point.
- `SUMMARY.md`: table of contents that defines sidebar/book navigation order.
- `v3.0/`: versioned docs content.
- `v3.0/introduction`, `v3.0/getting-started`, `v3.0/core-concepts`, `v3.0/advanced-features`, `v3.0/cli`: conceptual guides.
- `v3.0/packages/<package-name>/`: package-specific pages such as `overview.md`, `usage.md`, `contracts.md`, `architecture.md`, and optional `helpers.md`/`adapters.md`.

## Build, Test, and Development Commands
This repo is content-first and does not include a local build pipeline in version control. Use lightweight checks before opening a PR:

- `rg --files v3.0`: list tracked docs files quickly.
- `rg "TODO|TBD|FIXME" v3.0`: find unfinished content.
- `git diff -- v3.0 SUMMARY.md`: review exact content/navigation changes.
- `git status`: ensure only intended files are staged.

If you use a local Markdown preview tool/editor, verify heading hierarchy and link behavior before submitting.

## Coding Style & Naming Conventions
- Write in clear, instructional Markdown with concise paragraphs.
- Use `#`/`##`/`###` heading levels in logical order (no skipped levels).
- Use kebab-case file names (for example, `request-lifecycle.md`).
- Keep package docs consistent: prefer standard page names (`overview.md`, `usage.md`, `contracts.md`, etc.).
- Use fenced code blocks with language hints (for example, ```bash).

## Testing Guidelines
There is no automated test suite in this repository. Minimum validation for each change:

- Check internal links you edited.
- Confirm `SUMMARY.md` includes new/moved pages in the right section.
- Proofread for terminology consistency (`Quantum`, package names, command names like `qt`).

## Commit & Pull Request Guidelines
Recent history uses a conventional docs prefix:

- Commit format: `docs: <short description>`
- Example: `docs: complete Lang package docs for v3.0`

For pull requests:

- Keep scope focused to one section/package when possible.
- Include a short summary and list of changed paths.
- Link related issues (if any).
- If navigation changed, mention the `SUMMARY.md` update explicitly.

## Git Workflow
No formal GitFlow policy is documented, but recent history shows a consistent PR flow:

1. Create a feature branch from `master` using `docs/<topic>` naming (examples in history: `docs/v3-package-loader`, `docs/summary-add-config-links-20260525-1749`).
2. Use focused commits with `docs: ...` messages.
3. Keep the branch current with `master` before merge (history includes both rebases and `Merge branch 'master' into docs/...`).
4. Open a PR targeting `master` with:
   - scope summary
   - changed doc paths
   - note on `SUMMARY.md` impact (if any)
5. Merge through GitHub PR (default history pattern is merge commits: `Merge pull request #...`).
