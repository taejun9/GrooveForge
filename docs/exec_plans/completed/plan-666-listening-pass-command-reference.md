# plan-666-listening-pass-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after finished work and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Guide Command Reference row for Listening Pass with the existing local composition, arrangement, mix, and delivery audition checkpoints, Focus Readout, visible readout action, Quick Actions Listening Pass focus command, direct Listening Pass checkpoint commands, and local Focus Result feedback so beginners can know what to listen for and producers can scan audition posture from the command map without tutorials, macros, audio analysis, hidden generation, autoplay, playback start changes, reference-track import, remote analysis, or sampling-first onboarding.

## Non-Goals

- Do not change Listening Pass checkpoint derivation, priority, card order, Focus Readout derivation, visible readout action routing, focus routing, Focus Result labels, Quick Actions execution, direct checkpoint command behavior, selected Pattern state, Beat Readiness, Structure Lens, export/stem analysis, Delivery Target, Session Brief, project data, playback scheduling, render/export behavior, project schema, save/load, snapshots, undo/redo, or recommendations.
- Do not change Guide Quick Start, First Beat Path, Beat Spine, Mode Focus, Session Pass, Session Brief Compass, Composer Guide, Key Compass, Groove Compass, Beat Passport, Production Snapshot, Beat Readiness, Review Queue, Workflow Navigator, Workflow Spotlight, Beat Map, Structure Lens, Next Move, mixer/master controls, realtime playback, WAV/stem/MIDI export, or project file semantics.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, localStorage, or snapshots.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, auto-save, auto-export, hidden generation, automatic fixes, audio analysis, reference-track import or analysis, media uploads, sampling, imported audio, sampler devices, audio clips, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, or compliance claims.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Listening Pass checkpoints, Focus Readout, visible readout action, Quick Actions focus/checkpoint commands, focus routing, and local Focus Result feedback.
- `README.md` and `docs/product/product.md` describe Command Reference and Listening Pass command coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Listening Pass, Command Reference, playback/export, privacy, and local-first boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions/readouts only and must not alter Listening Pass behavior, command execution semantics, playback, render/export, project schema, privacy boundaries, or snapshot safety boundaries.

## Implementation Plan

- [x] Update the Guide Command Reference row for Listening Pass to show Quick Actions plus readout access.
- [x] Align README/product/quality/harness coverage with the command-map wording.
- [x] Complete QA, review, completed-plan move, and review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-21 | `git diff --check` | Passed. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-21 | `npm run typecheck` | Passed. |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-21 | `npm run build` | Passed with the existing Vite chunk-size warning. |
| 2026-06-21 | `npm run qa` | Passed. |
| 2026-06-21 | `npm run verify` | Passed with the existing Vite chunk-size warning; runtime smoke passed 14/14 sample-free blueprints and 14/14 style profiles. |
| 2026-06-21 | Post-move `git diff --check` | Passed. |
| 2026-06-21 | Post-move `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-21 | Post-move plan status check | Passed: active plans contain only `.gitkeep`; completed plan count is 666. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Listening Pass shortcut label plus aligned docs/harness text; Listening Pass checkpoint derivation, Focus Readout derivation, visible readout action routing, focus routing, Quick Actions focus/checkpoint command execution, local Focus Result feedback, selected Pattern state, Beat Readiness, Structure Lens, export/stem analysis, Delivery Target, Session Brief state, project data, playback, render/export, project schema, privacy boundaries, sampling, imported audio, and remote behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Listening Pass as a readout-backed Quick Actions command-reference entry. | The app already exposes local audition checkpoints, a Focus Readout, a visible readout action, Listening Pass focus/checkpoint commands, and local Focus Result feedback; the command map should make that direct listening guidance discoverable without tutorials, macros, audio analysis, hidden generation, autoplay, schema changes, sampling, or remote behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and completed plan count is 665; next 10-plan progress report is due at plan 670. |
| 2026-06-21 | harness_builder | Updated the Listening Pass Command Reference row to `Quick Actions / Readout` and aligned README, product, quality, and harness coverage while preserving Listening Pass checkpoint derivation, Focus Readout, visible readout action routing, focus routing, Quick Actions execution, selected Pattern state, playback, export, schema, privacy, sampling, and remote boundaries. |
| 2026-06-21 | quality_runner | Full QA passed: diff check, harness QA, typecheck, quality gate, build, npm QA, and verify; runtime smoke stayed sample-free across 14/14 blueprints and 14/14 style profiles. |
| 2026-06-21 | review_judge | Review passed after confirming only Command Reference and aligned documentation/harness expectations changed, with `src/ui/App.tsx` untouched. |
| 2026-06-21 | doc_gardener | Marked the plan completed after QA and review; moving it to completed plans and creating the review mirror. |
| 2026-06-21 | plan_keeper | Post-move validation passed with active plans empty except `.gitkeep` and completed plan count at 666. |
