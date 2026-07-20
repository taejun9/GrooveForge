# plan-1496-korean-readme

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / quality_runner / review_judge

## User Request

Replace the public root README with a Korean document and preserve the current English README as `readme-en.md`.

## Goal

Make Korean the primary repository introduction, retain the current English content without loss, provide clear language navigation, and align documentation QA with the bilingual root-document contract.

## Non-Goals

- Product, runtime, audio, project-schema, or release-behavior changes.
- Translating every durable document under `docs/`.
- Changing the local-first, direct-composition, or sampling-secondary product boundaries.

## Context Map

- Primary public entry: `README.md`
- Preserved English reference: `readme-en.md`
- Root document map: `AGENTS.md`
- Documentation QA: `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update the Decision Log when scope or approach changes.
- Do not implement or commit directly on `main`.
- Use `codex/plan-1496-korean-readme` and `.worktree/plan-1496-korean-readme`.
- Preserve commands, paths, identifiers, filenames, and technical terms accurately.

## Implementation Plan

- [x] Preserve the current English README as `readme-en.md`.
- [x] Create a Korean `README.md` with product, workflow, MVP, architecture, commands, QA, privacy, and repository-layout guidance.
- [x] Update root-document and QA contracts for the bilingual layout.
- [x] Run documentation QA and separate post-QA review.
- [x] Complete the plan/review mirror and prepare the verified branch for merge/push cleanup.

## QA Plan

- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `git diff --check`
- Direct byte comparison proving `readme-en.md` matches the pre-change `README.md` from `main`.
- Direct checks for Korean headings, language links, documented core commands, and root Markdown allowlist.

## Review Plan

QA completes before review starts. Review translation accuracy, command/path preservation, language navigation, product-invariant alignment, and whether the English original was preserved without truncation.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-20 | Use a concise current Korean primary README and preserve the existing exhaustive English README byte-for-byte. | The current file is 967 lines and mixes product introduction with a very large release/operator catalog; Korean users need a readable entry point while the full existing reference must remain available exactly as requested. |
| 2026-07-20 | Keep exhaustive package-script and completion-citation drift checks on `readme-en.md`, with focused Korean-entry expectations on `README.md`. | The preserved English reference still contains the complete operator catalog, while forcing every accumulated command paragraph into the Korean entry point would defeat its readability goal. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-20 | project_lead | Created plan-1496 in an isolated branch/worktree from clean main. |
| 2026-07-20 | repo_cartographer | Moved the 967-line English README to `readme-en.md` without byte changes and created a 278-line Korean primary README with language navigation and current product/developer guidance. |
| 2026-07-20 | quality_runner | Static QA, quality gate, diff checks, required command checks, root Markdown checks, Korean framing checks, and exact English-file byte comparison passed. |
| 2026-07-20 | review_judge | Separate post-QA review found commands and paths accurate, product/privacy boundaries intact, English preservation exact, and no blocking, major, or moderate finding. |

## Completion Notes

`README.md` is now the Korean public entry point. It covers the product spine, MVP, features, architecture, quick start, core QA, audio QA, desktop/release scope, privacy, agent workflow, repository layout, and links to the exhaustive English reference. The former 967-line `README.md` is preserved byte-for-byte as `readme-en.md`. Root-document, command-catalog, completion-citation, binary-text, and first-read framing QA now understand this bilingual layout.
