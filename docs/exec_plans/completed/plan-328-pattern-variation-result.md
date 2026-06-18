# plan-328-pattern-variation-result

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Add UI-local Pattern Variation Result feedback for the existing Subtle, Hook, and Break variation tools so visible Pattern Variation buttons and Quick Actions show the selected Pattern A/B/C preset, before/after event counts, changed events, audition cue, and next check after using the existing `applyPatternVariation` path.

## Non-Goals

- Do not change Pattern Variation algorithms, preset definitions, Pattern Fill, Pattern Clone, Pattern Stack, Layer Starter, Composer Actions, Next Move, arrangement, playback, render/export, save/load, project schema, or undo semantics.
- Do not add sampling, imported audio, remote AI, analytics, accounts, cloud sync, macros, autoplay, auto-arrangement, auto-export, or command chains.
- Do not persist Pattern Variation Result feedback in project data.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: existing `applyPatternVariation` handler, Pattern Variation buttons, Quick Actions routing, result strips for Pattern Clone/Stack/Fill, and Quick Action result helpers.
- `README.md`: public feature summary.
- `docs/product/product.md`: product behavior for Pattern Variation feedback.
- `docs/quality/rules.md`: Pattern Variation guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs/code alignment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-328-pattern-variation-result` and `.worktree/plan-328-pattern-variation-result` for repository work.

## Implementation Plan

- [x] Inspect existing Pattern Fill/Clone result-strip patterns and `applyPatternVariation`.
- [x] Add a UI-local Pattern Variation Result type, state, creator, and result strip.
- [x] Route visible Pattern Variation buttons and Quick Actions through the existing `applyPatternVariation` path while setting feedback from before/after selected Pattern A/B/C data.
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

QA completes before review starts. Review checks that Pattern Variation Result feedback is UI-local, derives only from before/after selected Pattern A/B/C data, uses the existing deterministic variation handler, remains shared by visible buttons and Quick Actions, and avoids schema, playback, export, sampling, remote AI, autoplay, macros, auto-arrangement, or command-chain changes.

## QA Results

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run build` passed; Vite reported `dist/assets/index-CIhWEMfz.js` at `500.60 kB` with the existing chunk-size warning.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 10/10 sample-free 8-bar blueprints and 10/10 supported style profiles.
- Browser smoke was not run because no callable in-app Browser control tool was exposed in this session.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Pattern Variation Result feedback instead of changing variation generation. | The product already has deterministic variation tools; feedback improves beginner clarity and producer review speed without changing the musical model. |
| 2026-06-18 | Keep Pattern Variation Result UI-local and derived from before/after selected Pattern A/B/C data. | Result feedback should explain an explicit edit without changing project schema, playback, export, or local-first boundaries. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on dedicated worktree from clean `main` at `6a49597`. |
| 2026-06-18 | harness_builder | Added Pattern Variation Result type, creator, state, and strip shared by visible buttons and Quick Actions through `applyPatternVariation`. |
| 2026-06-18 | quality_runner | QA, quality gate, typecheck, build, and verify passed; Browser smoke unavailable because no callable Browser tool was exposed. |
