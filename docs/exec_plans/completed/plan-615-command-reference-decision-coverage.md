# plan-615-command-reference-decision-coverage

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Make Command Reference expose the existing direct beat-making Decision Quick Actions for sound, stem audition, space, mix snapshot, and master finish workflows so command-search users can find the same explicit actions already documented and implemented.

## Non-Goals

- Do not add new sound, mix, master, sampling, imported-audio, sampler, plugin, remote AI, cloud sync, account, analytics, payment, or export behavior.
- Do not change Quick Actions execution, result derivation, project schema, saved project data, undo history, playback, WAV/stem/MIDI export, Handoff, or local draft behavior.
- Do not change the existing Decision Quick Action handlers; this plan only improves the read-only Command Reference map and its QA coverage.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns the visible Command Reference sections and rows.
- `src/ui/App.tsx` already owns the relevant Quick Actions: Sound Snapshot A/B Decision, Space FX Decision, Mix Snapshot A/B Decision, and Master Finish Decision.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` already describe Command Reference coverage for the existing decision commands.
- `harness/scripts/run_qa.py` enforces Command Reference token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Keep Command Reference UI-local and read-only; it must not run commands from the reference surface.

## Implementation Plan

- [x] Add missing Decision rows to the Sound, Mix, and Finish Command Reference sections.
- [x] Keep direct Command Reference targets aligned with existing Quick Action ids and direct beat-making wording.
- [x] Update QA expectations so the missing rows remain covered.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt.

## Review Plan

QA completes before review starts.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-21 | `git diff --check` | Passed. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-21 | `npm run typecheck` | Passed. |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-21 | `npm run build` | Passed with existing Vite large chunk warning. |
| 2026-06-21 | `npm run qa` | Passed. |
| 2026-06-21 | `npm run verify` | Passed with runtime smoke across 14/14 sample-free blueprints and 14/14 style profiles; existing Vite large chunk warning remained. |
| 2026-06-21 | `npm run dev -- --host 127.0.0.1` | Sandbox attempt failed with `listen EPERM`; escalated dev server started at `http://127.0.0.1:5173/`. |
| 2026-06-21 | `curl -I http://127.0.0.1:5173/` | Sandbox attempt could not connect; escalated smoke returned `HTTP/1.1 200 OK`. |
| 2026-06-21 | `git diff --check` | Passed after moving the completed plan and creating the review mirror. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Passed after moving the completed plan and creating the review mirror. |
| 2026-06-21 | `find docs/exec_plans/active -maxdepth 1 -type f -print` | Active plans contain only `docs/exec_plans/active/.gitkeep`. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. Command Reference rows map to existing Quick Action ids, remain UI-local/read-only, and do not touch project data, undo history, playback, export, sampling scope, or command execution handlers. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Scope plan-615 to Command Reference decision coverage. | The relevant Decision Quick Actions already exist, but the read-only Command Reference does not expose every documented sound/mix/master decision lane. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and progress is 614/650 plans, about 94.5%. |
| 2026-06-21 | harness_builder | Added Command Reference rows for Sound Snapshot A/B Decision, Space FX Decision, Stem Audition Decision, Mix Snapshot A/B Decision, Mix Snapshot A/B, and Master Finish Decision, then aligned README/product/quality/QA coverage. |
| 2026-06-21 | quality_runner | Completed QA through `npm run verify` plus dev server smoke; only the existing Vite large chunk warning appeared. |
| 2026-06-21 | review_judge | Reviewed id coverage and confirmed the change only updates read-only Command Reference rows plus docs/harness coverage. |
| 2026-06-21 | doc_gardener | Moved the plan to completed, created the review mirror, and confirmed active plans contain only `.gitkeep`. |
