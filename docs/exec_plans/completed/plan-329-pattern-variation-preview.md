# plan-329-pattern-variation-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Add a UI-local Pattern Variation Preview for the existing Subtle, Hook, and Break tools so users can inspect the selected Pattern A/B/C preset, before/after event posture, per-layer change counts, and apply target before running the existing deterministic `applyPatternVariation` path.

## Non-Goals

- Do not change Pattern Variation algorithms, preset definitions, Pattern Variation Result, Pattern Fill, Pattern Clone, Pattern Stack, Layer Starter, Composer Actions, Next Move, arrangement, playback, render/export, save/load, project schema, or undo semantics.
- Do not add sampling, imported audio, remote AI, analytics, accounts, cloud sync, macros, autoplay, auto-arrangement, auto-export, or command chains.
- Do not persist Pattern Variation Preview state in project data.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Pattern Variation buttons, selected Pattern state, preview component patterns, and Quick Actions routing.
- `src/ui/workstationUiModel.ts`: preview summary types.
- `src/ui/workstationPatternTools.ts`: deterministic Pattern Variation preview derivation from selected Pattern data.
- `README.md`: public feature summary.
- `docs/product/product.md`: product behavior for Pattern Variation Preview.
- `docs/quality/rules.md`: Pattern Variation guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs/code alignment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-329-pattern-variation-preview` and `.worktree/plan-329-pattern-variation-preview` for repository work.

## Implementation Plan

- [x] Inspect existing preview summary/component patterns and Pattern Variation result derivation.
- [x] Add a UI-local Pattern Variation Preview summary type and deterministic creator.
- [x] Add preview state and render a compact preview strip that updates from Pattern Variation button focus/hover while apply clicks still route through `applyPatternVariation`.
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
- Browser smoke if environment exposes a callable browser control tool; otherwise record the blocker.

## Review Plan

QA completes before review starts. Review checks that Pattern Variation Preview is UI-local, derives only from selected Pattern A/B/C data and existing deterministic variation logic, does not mutate project data before explicit Apply, keeps visible buttons and Quick Actions on the existing `applyPatternVariation` path, and avoids schema, playback, export, sampling, remote AI, autoplay, macros, auto-arrangement, or command-chain changes.

## QA Results

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run build` passed; Vite reported `dist/assets/index-E6zYf128.js` at `501.84 kB` with the existing chunk-size warning.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 10/10 sample-free 8-bar blueprints and 10/10 supported style profiles.
- Browser smoke was not run because no callable in-app Browser control tool was exposed in this session.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Pattern Variation Preview before changing any Pattern data. | Beginners need to understand what a variation will do, while producers benefit from a fast pre-apply change scan. |
| 2026-06-18 | Keep preview target state UI-local and driven only by Pattern Variation button focus or hover. | The preview should explain explicit direct-composition choices without mutating project data or creating hidden automation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on dedicated worktree from clean `main` at `29e4e9e`. |
| 2026-06-18 | harness_builder | Added Pattern Variation Preview summary, UI-local preview preset state, and compact preview strip before the existing variation buttons. |
| 2026-06-18 | quality_runner | QA, quality gate, typecheck, build, and verify passed; Browser smoke unavailable because no callable Browser tool was exposed. |
