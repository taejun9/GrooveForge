# plan-113-style-aware-composer-actions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Make Composer Actions more useful across genres by applying style-aware priorities, thresholds, and action copy. Beginners should see the most musically relevant next writing move for the selected style; producers should be able to scan a compact action rail that reflects the current style profile rather than a generic fixed order.

## Non-Goals

- Do not add sample import, chopping, sampler tracks, audio clips, remote AI, analytics, accounts, or cloud sync.
- Do not auto-apply any Composer Action; every mutation must require an explicit button click.
- Do not create a new hidden generation system or bypass existing undoable handlers.
- Do not claim genre authenticity, commercial readiness, automatic songwriting, or automatic mastering.

## Context Map

- Product direction: `docs/product/product.md`
- Quality rules: `docs/quality/rules.md`
- Composer Guide and Composer Actions: `src/ui/App.tsx`
- Styling: `src/styles.css`
- Harness expectations: `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-113-style-aware-composer-actions` and `.worktree/plan-113-style-aware-composer-actions` for repository work.
- Keep all recommendations deterministic, local, explicit-click, editable, and undoable.

## Implementation Plan

- [x] Inspect current Composer Actions derivation and style profile data.
- [x] Add a small style-priority map for drums, 808/bass, harmony, melody, arrangement, and finish.
- [x] Adjust action thresholds and details where style intent differs, while preserving all six action areas.
- [x] Sort or mark Composer Actions by style-aware priority without removing direct controls.
- [x] Update docs, quality rules, and QA expectations for style-aware local action priorities.
- [x] Run QA, browser smoke, review, and completion docs before merge.

## QA Plan

- Run `npm run qa`.
- Run `npm run verify`.
- Browser smoke test the local app to verify:
  - `composer-actions` still renders.
  - Six explicit buttons still render.
  - The headline/detail mention style-aware action priority.
  - Buttons remain native user-clicked controls.
  - There are no console errors or horizontal overflow at desktop and responsive widths.

## Review Plan

QA completes before review starts. Review checks for deterministic local derivation, explicit-click behavior, undoable routing, all-genre product alignment, sampling guardrails, and UI regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add style-aware Composer Actions priority instead of new generation. | The next step toward a professional yet beginner-friendly workstation is making existing explicit writing moves feel more genre-relevant without adding hidden automation or sampling. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | repo_cartographer | Inspected Composer Actions and existing style profile data. |
| 2026-06-16 | harness_builder | Added deterministic style-aware Composer Action profiles, thresholds, cues, priorities, and sorting. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for style-aware local action priority. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `npm run qa`, `npm run verify`, and Browser smoke passed. |
| 2026-06-16 | review_judge | Review found no blocking issues. |

## Completion Notes

Composer Actions now uses selected style profile data to prioritize, label, and threshold direct writing moves. The panel still shows six explicit user-clicked controls and routes mutations only through existing undoable handlers. Sampling, imported audio, hidden generation, remote AI, analytics, accounts, and cloud sync remain out of scope.
