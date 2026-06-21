# plan-654-stem-audition-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after finished work and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Mix Command Reference row for Stem Audition with the existing local Stem Audition Readout, Stem Audition Decision, explicit Full Mix/Drums/808/Synth/Chords audition pads, direct Stem Audition Quick Actions commands, and local result feedback so beginners can compare stems safely and producers can jump to full mix/stem checks from the Mix command map.

## Non-Goals

- Do not change Stem Audition pad definitions, readout derivation, decision routing, result labels, mixer solo/mute update behavior, playback scheduling, render/export behavior, project schema, save/load, snapshots, undo/redo, or Quick Actions execution beyond the existing Stem Audition command paths.
- Do not change Mix Balance, Mix Snapshot A/B, Mix Coach, Master Finish, Handoff Pack, mixer/master controls, realtime playback, WAV/stem/MIDI export, or project file semantics.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, localStorage, or snapshots.
- Do not add rendered stem playback, stem separation, reference audio, imported audio, audio uploads, sample browsing, sampler tracks, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Stem Audition pads, readout derivation, decision routing, direct Quick Actions commands, and local result feedback.
- `README.md` and `docs/product/product.md` describe Stem Audition and its command-map coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Stem Audition, Command Reference, playback/export, and local-first boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions/readouts only and must not alter Stem Audition behavior, command execution semantics, playback, render/export, project schema, or snapshot safety boundaries.

## Implementation Plan

- [x] Update the Mix Command Reference row for Stem Audition to show Quick Actions plus readout access.
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
| 2026-06-21 | `git diff --check` | Pass. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Pass. `GrooveForge QA passed.` |
| 2026-06-21 | `npm run typecheck` | Pass. Both app and Electron TypeScript projects compile with `--noEmit`. |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | Pass. `GrooveForge quality gate passed.` |
| 2026-06-21 | `npm run build` | Pass. Existing Vite chunk-size warning only. |
| 2026-06-21 | `npm run qa` | Pass. `GrooveForge QA passed.` |
| 2026-06-21 | `npm run verify` | Pass. Quality gate, runtime smoke, typecheck, and build passed; runtime smoke reported 14/14 sample-free blueprints and 14/14 supported styles. Existing Vite chunk-size warning only. |
| 2026-06-21 | post-move `git diff --check` | Pass. |
| 2026-06-21 | post-move `python3 harness/scripts/run_qa.py` | Pass. `GrooveForge QA passed.` |
| 2026-06-21 | post-move active plan check | Pass. Active exec plans contain only `.gitkeep`. |
| 2026-06-21 | post-move completed count | Pass. Completed exec plan count is 654. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Stem Audition shortcut label plus aligned docs/harness text; Stem Audition pad definitions, readout derivation, decision routing, local result feedback, mixer solo/mute update behavior, Quick Actions execution, playback scheduling, render/export, project schema, sampling, imported audio, and remote behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Stem Audition as a readout-backed Quick Actions command-reference entry. | The app already exposes local Stem Audition Readout context, a Decision target, explicit Full Mix/Drums/808/Synth/Chords pads, direct Quick Actions commands, and result feedback; the command map should make that comparison path discoverable without playback, render/export, schema, sampling, or remote changes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming the plan-654 worktree is clean, active plans are empty, and completed plan count is 653 in the post-650 completion-hardening pass. |
| 2026-06-21 | harness_builder | Updated the Stem Audition Command Reference row to `Quick Actions / Readout` and aligned README, product, quality, and QA harness coverage while preserving Stem Audition pad/readout/decision/result routing, playback, export, schema, sampling, and remote boundaries. |
| 2026-06-21 | quality_runner | Full QA passed: diff check, harness QA, typecheck, quality gate, build, qa, and verify. Runtime smoke covered 14/14 sample-free blueprints and 14/14 supported styles. |
| 2026-06-21 | review_judge | Review passed after QA; no follow-up code changes required. |
| 2026-06-21 | doc_gardener | Marked the plan completed before moving it to completed plans and creating the review mirror. |
| 2026-06-21 | doc_gardener | Moved the completed plan to `docs/exec_plans/completed/`, created the review mirror, and confirmed active plans are empty with 654 completed plans. |
