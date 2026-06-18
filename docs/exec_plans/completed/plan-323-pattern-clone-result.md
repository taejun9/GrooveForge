# plan-323-pattern-clone-result

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Add a UI-local Pattern Clone Result so users can see exactly which Pattern A/B/C slot was cloned, which deterministic variation was applied, what changed, and what to audition next after using Pattern Clone Pads or Quick Actions.

## Non-Goals

- Do not change Pattern Clone variation algorithms.
- Do not change project schema, save/load, undo/redo, playback, render/export, Handoff, Pattern Stack, Pattern Compare, or Pattern DNA behavior.
- Do not add sampling, imported audio, remote AI, analytics, accounts, cloud sync, macros, autoplay, auto-arrangement, or command chains.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Pattern Clone state, handler, UI placement, Quick Actions routing.
- `src/ui/workstationUiModel.ts`: UI-local result types.
- `src/ui/workstationPatternTools.ts`: Pattern Clone options and pure result helpers.
- `docs/product/product.md`: Pattern Clone product behavior.
- `docs/quality/rules.md`: Pattern Clone guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs/code alignment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-323-pattern-clone-result` and `.worktree/plan-323-pattern-clone-result` for repository work.

## Implementation Plan

- [x] Inspect current Pattern Clone Pad and Quick Actions clone paths.
- [x] Add UI-local Pattern Clone Result types and deterministic before/after helper.
- [x] Render a Pattern Clone Result strip after explicit pad or command runs.
- [x] Update product/quality docs and static QA expectations.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost; otherwise record the environment blocker.

## Review Plan

QA completes before review starts. Review checks that Pattern Clone Result is UI-local, derives only from before/after Pattern A/B/C data and existing clone metadata, keeps clone behavior deterministic and manually editable, preserves arrangement assignments and export/playback behavior, and avoids sampling, remote AI, macros, command chains, autoplay, or auto-arrangement.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Pattern Clone Result before larger creation engines. | Clone-and-vary is central to making A/B/C beat sections; explicit feedback helps beginners confirm the move and producers scan variation impact quickly. |
| 2026-06-18 | Keep Pattern Clone Result UI-local. | The result is operational feedback from before/after Pattern A/B/C data and should not change project schema, playback, export, or arrangement data. |
| 2026-06-18 | Move the result component into the Pattern Tools manual chunk. | The extra result UI pushed the app entry near the warning threshold; chunking it with Pattern Tools kept the production entry under 500KB without raising the warning limit. |
| 2026-06-18 | Mark the Source metric as preserved rather than warning. | The source Pattern should remain unchanged after clone-and-vary, so the result strip should show that as expected state. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on dedicated worktree from clean `main` at `830eefc`. |
| 2026-06-18 | harness_builder | Added `PatternCloneResult` UI types, before/after result helper, and `PatternCloneResultStrip` rendered after Pattern Clone Pads. |
| 2026-06-18 | harness_builder | Routed Pattern Clone Pad clicks and Quick Actions through the same clone handler so both show source, target, variation, changed target events, audition cue, and next check. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, static QA expectations, and Vite manual chunk expectations for the new result component. |
| 2026-06-18 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Production build entry stayed under the warning threshold at `499.07 kB`. |
| 2026-06-18 | quality_runner | Browser smoke was not run because no callable in-app Browser control tool was exposed in this session after tool discovery. |
| 2026-06-18 | review_judge | Review found the change UI-local, deterministic, scoped to Pattern Clone feedback, and free of sampling, remote AI, analytics, account, cloud sync, autoplay, macro, schema, playback, render, or export changes. |
