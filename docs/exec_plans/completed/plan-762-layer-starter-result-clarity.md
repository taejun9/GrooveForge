# plan-762-layer-starter-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Layer Starter result metrics identify the explicit starter action, active priority or direct starter lane, selected Pattern, target layer count/status, before/current loop event posture, drum/music layer counts, and song length so beginners understand what layer was started and producers can scan the resulting loop balance immediately after command execution.

## Non-Goals

- Do not change Layer Starter priority derivation, option derivation, direct starter command definitions, visible Priority Readout behavior, or Layer Starter Result behavior.
- Do not change Drum Foundation, 808 Bassline, Chord Progression, Melody Motif, Pattern DNA, Pattern Stack, Pattern Compare, Pattern A/B/C event data outside the existing explicit starter handlers, arrangement data, playback, render/export, save/load, local draft, Handoff, or sampler boundaries.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, hidden generation, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Layer Starter Quick Actions, starter handlers, and generic Quick Action Result metric snapshots.
- `README.md` and `docs/product/product.md` describe Layer Starter as explicit direct-composition routing for selected-Pattern Drums/808/Chords/Synth readiness.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Layer Starter routing and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-762-layer-starter-result-clarity` and `.worktree/plan-762-layer-starter-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Layer Starter Quick Action result metrics and current command detail format.
- [x] Add structured Layer Starter result metric helpers without changing existing starter routing or option derivation.
- [x] Update product/docs language and QA harness expectations for Layer Starter result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Layer Starter Quick Action result feedback is clearer while preserving priority derivation, direct starter routing, Pattern A/B/C event semantics, arrangement data, playback, export, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the generic Quick Action Result metric instead of changing Layer Starter options, priority, or starter handlers. | Layer Starter already routes explicit starts through existing composition handlers; the post-run metric should expose target layer and loop balance without changing generation or editing semantics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Layer Starter Quick Action result clarity. |
| 2026-06-25 | harness_builder | Added structured Layer Starter Quick Action result metric helpers plus product, quality, and QA harness expectations while preserving existing priority derivation, direct starter routing, Pattern A/B/C event semantics, playback, export, and sampler boundaries. |
| 2026-06-25 | quality_runner | Ran `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; all passed, with the existing Vite chunk-size warning during build output. |
| 2026-06-25 | review_judge | Reviewed the diff for Layer Starter priority derivation, option derivation, direct starter routing, Pattern A/B/C event semantics, arrangement data, playback, export, remote, and sampler boundaries; no blocking findings. |
