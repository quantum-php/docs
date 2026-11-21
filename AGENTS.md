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
The workflow `.github/workflows/docs-check.yml` checks every pull request into `staging` and `master`. Run the same checks locally before you push, from the repository root:

- `node scripts/check-summary.mjs`: every page `SUMMARY.md` links to exists, and every page under `v3.0` is listed in `SUMMARY.md`.
- `lychee --config lychee.toml README.md SUMMARY.md 'v3.0/**/*.md'`: links between the pages and the `#heading` anchors they point to. Links to other sites are not checked.
- `npx markdownlint-cli2@0.18.1`: the Markdown rules in `.markdownlint-cli2.jsonc` (heading order, code blocks with a language hint, blank lines and list markers), with the version CI uses; a newer version knows more rules and reports findings CI does not. `npx markdownlint-cli2@0.18.1 --fix` repairs most findings.
- `vale README.md SUMMARY.md v3.0`: the wording rules in `.vale/styles/Quantum` (names such as `Quantum`, `GitHub` and `PHPUnit`, no history narration outside the upgrade guide, filler words) and the spell check. Add a correct word it does not know to `.vale/styles/config/vocabularies/Quantum/accept.txt`. On a pull request Vale only reports warnings on the lines the pull request adds.

The first three fail the pull request. Lychee and Vale are single programs from [lychee](https://github.com/lycheeverse/lychee/releases) and [Vale](https://github.com/errata-ai/vale/releases); `npx` downloads markdownlint-cli2 on first use.

The checks cannot tell whether a statement matches the framework code, so also:

- Check every statement and example name you add against the framework code.
- Confirm `SUMMARY.md` lists new or moved pages in the right section.

## Commit & Pull Request Guidelines
The prefix says what a commit changes:

- `docs: <short description>` for the documentation itself: the pages under `v3.0`, `README.md` and `SUMMARY.md`. Example: `docs: complete Lang package docs for v3.0`.
- `chore: <short description>` for the tooling around it: the workflows in `.github`, `scripts`, the configs of the checks (`lychee.toml`, `.markdownlint-cli2.jsonc`, `.vale.ini`, `.vale`) and this file. Example: `chore: check links and anchors on pull requests`.

A commit that changes pages only to satisfy a new check, in the same commit as the check, uses `chore:`.

For pull requests:

- Keep scope focused to one section/package when possible.
- Include a short summary and list of changed paths.
- Link related issues (if any).
- If navigation changed, mention the `SUMMARY.md` update explicitly.

## Git Workflow

1. Create a feature branch from `master` using `docs/<topic>` naming (examples in history: `docs/v3-package-loader`, `docs/summary-add-config-links`).
2. Use focused commits with `docs: ...` or `chore: ...` messages (see above).
3. Keep the branch current with `master` before merge (history includes both rebases and `Merge branch 'master' into docs/...`).
4. Open a PR targeting `master` with:
   - scope summary
   - changed doc paths
   - note on `SUMMARY.md` impact (if any)
5. Merge through GitHub PR (default history pattern is merge commits: `Merge pull request #...`).
