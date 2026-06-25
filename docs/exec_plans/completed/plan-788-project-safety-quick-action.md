# plan-788-project-safety-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Add a Project Safety Readout Quick Action that opens a UI-local result metric for current project safety posture, file identity, local draft state, unsaved-edit context, selected Pattern, editable drum/808/Synth/chord counts, total editable event count, Pattern A/B/C usage, snapshot slot count, arrangement block count, song length, export readiness, and next save or recovery check so beginners can find safety status from command search and working producers can verify session protection quickly.

## Non-Goals

- Do not change project file save/open behavior, local draft storage, restore/clear handlers, snapshot storage, project schema, undo/redo history reset semantics, playback, render/export, MIDI export, Handoff, or Command Reference overlay behavior.
- Do not add autosave, file versioning, destructive filesystem actions, cloud sync, accounts, analytics, remote AI, command chains, macros, hidden generation, sampling, imported audio, or sample-pack workflows.

## Context Map

- `src/ui/App.tsx` owns Project Safety Readout summary derivation, Quick Actions definitions, and generic Quick Action result metric snapshots.
- `README.md` and `docs/product/product.md` describe local-first project safety and direct beat-making session continuity.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin project safety readout behavior, local draft privacy, project-file safety, snapshots, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-788-project-safety-quick-action` and `.worktree/plan-788-project-safety-quick-action` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Project Safety Readout derivation, Quick Actions definition flow, and result metric routing.
- [x] Add a Project Safety Readout Quick Action and structured result metric without changing save/open, draft, snapshot, project schema, playback, or export behavior.
- [x] Update product/docs language and QA harness expectations for Project Safety Quick Action coverage.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Project Safety Readout is discoverable and returns clearer local safety metrics while preserving save/open routing, local draft storage, snapshot storage, project schema, undo/redo history reset semantics, Pattern A/B/C event semantics, arrangement data, playback, export, remote, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Add a Project Safety Readout Quick Action instead of changing safety derivation. | The existing readout already derives safety posture; command access and result metrics make it easier to find without changing project data behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 787 completed plans; next 10-plan progress checkpoint is plan-790. |
| 2026-06-26 | harness_builder | Added a Project Safety Readout Quick Action with UI-local checked result metrics for readout context, default project-file name, snapshot slot count, editable event counts, arrangement/export posture, and next save or recovery check, then pinned README/product/quality/harness expectations. |

## QA Log

| command | result |
|---|---|
| `git diff --check` | passed |
| `python3 harness/scripts/run_qa.py` | passed |
| `npm run typecheck` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run build` | passed with existing Vite chunk-size warning |
| `npm run qa` | passed |
| `npm run verify` | passed with existing Vite chunk-size warning |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-26 | review_judge | No findings. The change is limited to a Project Safety Readout Quick Action, UI-local checked result metrics, and pinned docs/harness expectations while preserving save/open routing, local draft storage, snapshot storage, project schema, undo/redo history reset semantics, playback/export behavior, remote boundaries, and sampling boundaries. |
