# plan-635-mix-snapshot-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Mix Command Reference row for Mix Snapshot A/B with the existing Mix Snapshot A/B comparison readout and Quick Actions capture/recall/clear commands so beginners and producers can discover headroom, balance, master, and stem-pass comparison controls before changing UI-local mix snapshots or undoable mixer/master recall.

## Non-Goals

- Do not change Mix Snapshot slot derivation, capture payloads, recall payloads, comparison metrics, decision labels, result labels, disabled-state rules, capture/clear handlers, undoable mixer/master recall behavior, playback behavior, render/export behavior, project schema, save/load, snapshots, or keyboard shortcut handling.
- Do not change Quick Actions ranking, search, pinning, recents, command execution beyond the existing capture/recall/clear command paths, Mix Snapshot Decision, Mix Snapshot A/B panel behavior, Stem Audition, Mix Balance, Mix Coach, Master Finish, or Handoff Pack behavior.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, or snapshots.
- Do not add automatic recall, automatic capture, reference audio, rendered reference imports, audio uploads, auto-mixing, auto-mastering, autoplay, render downloads, auto-export, LUFS/true-peak/platform compliance claims, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Mix Snapshot A/B comparison, Decision Readout, Quick Actions decision/capture/recall/clear commands, UI-local slot state, and undoable mixer/master recall.
- `README.md` and `docs/product/product.md` describe Mix Snapshot A/B readouts and command access.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Command Reference, Mix Snapshot, playback/export, and local-first boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions/readouts only and must not alter Mix Snapshot capture/recall, command execution semantics, playback, render/export, project schema, or snapshot safety boundaries.

## Implementation Plan

- [x] Update the Mix Command Reference row for Mix Snapshot A/B to show Quick Actions plus readout access.
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
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Passed: `GrooveForge QA passed.` |
| 2026-06-21 | `npm run typecheck` | Passed. |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | Passed: `GrooveForge quality gate passed.` |
| 2026-06-21 | `npm run build` | Passed with existing Vite chunk-size warning. |
| 2026-06-21 | `npm run qa` | Passed: `GrooveForge QA passed.` |
| 2026-06-21 | `npm run verify` | Passed: quality gate, runtime smoke, typecheck, and build completed; runtime smoke covered 14/14 sample-free blueprints and 14/14 supported styles. Existing Vite chunk-size warning remains. |
| 2026-06-21 | `git diff --check` after completed-plan move | Passed. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` after completed-plan move | Passed: `GrooveForge QA passed.` |
| 2026-06-21 | `find docs/exec_plans/active -maxdepth 1 -type f -print` | Passed: only `docs/exec_plans/active/.gitkeep` remains active. |
| 2026-06-21 | `find docs/exec_plans/completed -maxdepth 1 -type f -name 'plan-*.md' -print | wc -l` | Passed: 635 completed plans. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Mix Snapshot A/B shortcut label plus aligned docs/harness text; Mix Snapshot slot derivation, capture/clear handlers, undoable mixer/master recall, playback, render/export, project schema, command execution, sampling, remote behavior, automatic capture, and automatic recall behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Mix Snapshot A/B as a readout-backed Quick Actions command-reference entry. | The app already exposes headroom, balance, master, and stem-pass comparison through UI-local A/B slots and explicit Quick Actions capture/recall/clear commands; the command map should help beginners compare mix passes and let producers scan A/B posture quickly without auto-applying changes or changing playback/export behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and progress is 634/650 plans, about 97.5%. |
| 2026-06-21 | harness_builder | Aligned the Mix Command Reference Mix Snapshot A/B row, README/product wording, quality rule, and harness coverage with the existing A/B comparison readout and explicit snapshot handlers. |
| 2026-06-21 | quality_runner | Full QA passed before review: diff check, harness QA, typecheck, quality gate, build, npm QA, and verify. |
| 2026-06-21 | review_judge | Reviewed the final diff after QA and found no follow-up issues. |
| 2026-06-21 | doc_gardener | Marked the plan complete for completed-plan move and review mirror creation. |
