# plan-662-session-brief-compass-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after finished work and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Guide Command Reference row for Session Brief Compass with the existing local direction, reference, artist/vocal context, and handoff readiness cards, Brief Compass focus command, direct Brief Compass card commands, and local Focus Result feedback so beginners can fill a useful session brief and producers can keep direction/reference/handoff context visible from the command map without tutorials, macros, reference audio import, remote analysis, or sampling-first onboarding.

## Non-Goals

- Do not change Session Brief Compass card derivation, scoring, order, focus routing, result labels, manual Session Brief editing, clear behavior, starter pads, project data, playback scheduling, render/export behavior, project schema, save/load, snapshots, undo/redo, or Quick Actions execution beyond existing Session Brief Compass focus/card command paths.
- Do not change Guide Quick Start, First Beat Path, Beat Spine, Session Pass, Workflow Navigator, Workflow Spotlight, Composer Guide, Mode Focus, Handoff Pack, mixer/master controls, realtime playback, WAV/stem/MIDI export, or project file semantics.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, localStorage, or snapshots.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, auto-save, auto-export, hidden generation, reference-track import or analysis, media uploads, sampling, imported audio, sampler devices, audio clips, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, or compliance claims.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Session Brief Compass cards, focus routing, direct Brief Compass card commands, Starter Pads, manual brief editing, and local Focus Result feedback.
- `README.md` and `docs/product/product.md` describe Command Reference and Session Brief Compass command coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Session Brief Compass, Command Reference, playback/export, privacy, and local-first boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions/readouts only and must not alter Session Brief Compass behavior, command execution semantics, playback, render/export, project schema, privacy boundaries, or snapshot safety boundaries.

## Implementation Plan

- [x] Update the Guide Command Reference row for Session Brief Compass to show Quick Actions plus readout access.
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
| 2026-06-21 | Post-move plan status check | Passed: active plans contain only `.gitkeep`; completed plan count is 662. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Session Brief Compass shortcut label plus aligned docs/harness text; Session Brief Compass card derivation, focus routing, Quick Actions focus/card command execution, local Focus Result feedback, manual brief editing, clear behavior, Starter Pads, project data, playback, render/export, project schema, privacy boundaries, sampling, imported audio, and remote behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Session Brief Compass as a readout-backed Quick Actions command-reference entry. | The app already exposes direction, reference, artist/vocal context, and handoff readiness cards, a Brief Compass focus command, direct card commands, and local Focus Result feedback; the command map should make that session-context guidance discoverable without tutorials, macros, reference audio import, remote analysis, schema changes, sampling, or remote behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and completed plan count is 661; next 10-plan progress report is due at plan 670. |
| 2026-06-21 | harness_builder | Updated the Session Brief Compass Command Reference row to `Quick Actions / Readout` and aligned README, product, quality, and harness coverage while preserving brief derivation, manual editing, Starter Pads, focus routing, playback, export, schema, privacy, sampling, and remote boundaries. |
| 2026-06-21 | quality_runner | Full QA passed: diff check, harness QA, typecheck, quality gate, build, npm QA, and verify; runtime smoke stayed sample-free across 14/14 blueprints and 14/14 style profiles. |
| 2026-06-21 | review_judge | Review passed after confirming only Command Reference and aligned documentation/harness expectations changed, with `src/ui/App.tsx` untouched. |
| 2026-06-21 | doc_gardener | Marked the plan completed after QA and review; moving it to completed plans and creating the review mirror. |
| 2026-06-21 | plan_keeper | Post-move validation passed with active plans empty except `.gitkeep` and completed plan count at 662. |
