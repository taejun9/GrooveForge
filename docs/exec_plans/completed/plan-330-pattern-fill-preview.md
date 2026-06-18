# plan-330-pattern-fill-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Add a UI-local Pattern Fill Preview for Drum Fill, 808 Pickup, Melody Turn, and Clear Tail so users can inspect the selected Pattern A/B/C preset, before/after event posture, per-layer tail change counts, and apply target before running the existing deterministic `applyPatternFill` path.

## Non-Goals

- Do not change Pattern Fill algorithms, preset definitions, Pattern Fill Result, Pattern Variation, Pattern Clone, Pattern Stack, Layer Starter, Composer Actions, Next Move, arrangement, playback, render/export, save/load, project schema, or undo semantics.
- Do not add sampling, imported audio, remote AI, analytics, accounts, cloud sync, macros, autoplay, auto-arrangement, auto-export, or command chains.
- Do not persist Pattern Fill Preview state in project data.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Pattern Fill buttons, selected Pattern state, preview component patterns, and Quick Actions routing.
- `src/ui/workstationUiModel.ts`: preview summary types.
- `src/ui/workstationPatternTools.ts`: deterministic Pattern Fill preview derivation from selected Pattern data.
- `README.md`: public feature summary.
- `docs/product/product.md`: product behavior for Pattern Fill Preview.
- `docs/quality/rules.md`: Pattern Fill guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs/code alignment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-330-pattern-fill-preview` and `.worktree/plan-330-pattern-fill-preview` for repository work.

## Implementation Plan

- [x] Inspect existing Pattern Fill Result and Pattern Variation Preview patterns.
- [x] Add a UI-local Pattern Fill Preview summary type and deterministic creator using `applyPatternFillPreset` as a dry-run.
- [x] Add preview state and render a compact preview strip that updates from Pattern Fill button focus/hover while apply clicks still route through `applyPatternFill`.
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

QA completes before review starts. Review checks that Pattern Fill Preview is UI-local, derives only from selected Pattern A/B/C data, current key, and existing deterministic fill logic, does not mutate project data before explicit Apply, keeps visible buttons and Quick Actions on the existing `applyPatternFill` path, and avoids schema, playback, export, sampling, remote AI, autoplay, macros, auto-arrangement, or command-chain changes.

## QA Results

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run build` passed. Vite still reports the expected chunk warning for `dist/assets/index-DMignMLW.js` at 503.00 kB.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 10/10 sample-free blueprints and 10/10 style profiles.
- Browser smoke was not run because tool discovery did not expose a callable in-app Browser control tool.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Pattern Fill Preview before changing Pattern tail data. | Beginners need a pre-apply explanation of fills, and producers need a fast transition-tail scan before committing edits. |
| 2026-06-18 | Keep Pattern Fill Preview UI-local and derived through `applyPatternFillPreset` dry-run output. | Preview should explain the existing fill path without mutating project data, changing undo history, or creating a new generation path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on dedicated worktree from clean `main` at `2c58452`. |
| 2026-06-18 | harness_builder | Added Pattern Fill Preview type, deterministic summary creator, UI-local preview state, compact preview strip, and focus/hover preview targeting for Pattern Fill buttons. |
| 2026-06-18 | harness_builder | Updated README, product rules, quality rules, and static QA expectations for Pattern Fill Preview and Result alignment. |
| 2026-06-18 | quality_runner | Completed typecheck, QA, diff check, build, quality gate, npm QA, and npm verify. Browser smoke unavailable because no callable in-app Browser tool was exposed. |
