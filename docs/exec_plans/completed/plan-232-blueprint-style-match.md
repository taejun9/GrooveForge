# plan-232-blueprint-style-match

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat-making mini DAW that can satisfy working producers while staying approachable for beginners. Keep sampling secondary and make the direct beat-making starter path easier to use.

## Goal

Add a UI-local Beat Blueprint Style Match strip that shows the dedicated starter for the current style and gives explicit Preview and Apply controls. This should make the 10-style Blueprint catalog easier for beginners to use and faster for producers to scan without changing project schema, Blueprint definitions, or export behavior.

## Non-Goals

- No new Beat Blueprint metadata, style definitions, saved project schema, audio engine, render algorithm, playback scheduling, sample import, imported audio, sampler devices, audio clips, remote AI, plugin hosting, accounts, analytics, or cloud sync.
- No auto-applying Blueprints when style changes.
- No replacement of the existing Blueprint preview, list, Apply buttons, result strip, Next Move recommendation, or Quick Actions behavior.

## Context Map

- `src/ui/App.tsx`: Beat Blueprint panel, current preview/result logic, `suggestedBlueprintId`.
- `src/styles.css`: Blueprint panel layout and responsive styling.
- `harness/scripts/run_qa.py`: static expectations.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: durable starter-path documentation.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-232-blueprint-style-match` and `.worktree/plan-232-blueprint-style-match`.
- The strip must stay UI-local, explicit-click-only, and out of saved project data and undo history.

## Implementation Plan

- [x] Inspect existing Blueprint panel layout and static QA expectations.
- [x] Add a style-match summary derived from `project.styleId`, `styleProfiles`, `beatBlueprints`, and existing preview summary logic.
- [x] Render Preview and Apply controls for the matching Blueprint without changing existing list/preview/result behavior.
- [x] Add responsive CSS and static QA expectations.
- [x] Update product/quality docs, run QA, review, complete the plan, merge, push, and clean up.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser/dev-server smoke if the environment permits local server binding.

## Review Plan

QA completes before review starts. Review checks UI-local derivation, explicit-click-only Preview/Apply behavior, no Blueprint definition drift, no project schema or export changes, no sampling-first drift, and responsive styling coverage.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a current-style match strip instead of filtering or reordering the Blueprint list. | Users still need the full starter catalog, but the current style starter should be immediately visible and actionable. |
| 2026-06-17 | Reuse `suggestedBlueprintId` and existing preview summary logic for the match strip. | This keeps the new strip aligned with Next Move, the full Blueprint list, and existing Preview/Apply behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after confirming the catalog now covers all styles but the panel still presents all starters as a flat list. |
| 2026-06-17 | harness_builder | Added a UI-local Beat Blueprint Style Match strip with current-style starter label, detail, status, Preview, and Apply controls. |
| 2026-06-17 | harness_builder | Added responsive Blueprint Style Match styling while preserving the existing preview card, full Blueprint list, and result strip. |
| 2026-06-17 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for the current-style Match strip. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run typecheck`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`. |
| 2026-06-17 | quality_runner | Browser/dev-server smoke was not rerun because prior localhost binding attempts remain blocked by environment policy. |
| 2026-06-17 | quality_runner | After moving this plan to completed and creating the review mirror, passed `python3 harness/scripts/run_qa.py`, `git diff --check`, and `npm run verify`. |

## Completion Notes

Implemented and QA passed. Beat Blueprint Style Match now shows the current style starter with explicit Preview and Apply controls, while preserving the full Blueprint list and existing apply/result behavior. The completion review mirror is `docs/reviews/plan-232-blueprint-style-match-review.md`.
