# plan-588-master-automation-preview-decision-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a UI-local Master Automation Preview Decision Readout so the currently suggested master fade posture exposes readiness, automation event scope, and an explicit Apply Suggested Automation action before users commit None/Fade In/Fade Out/Intro-Outro master volume automation changes.

## Non-Goals

- Do not change master automation preset definitions, automation rendering, playback scheduling, export, MIDI, snapshots, local draft recovery, undo semantics, Mix Balance, Space FX, Master Finish, or Handoff behavior.
- Do not auto-apply automation, autoplay, auto-export, chain multiple commands, or persist preview/decision state in project data, localStorage, or undo history.
- Do not add imported audio, recording, sample browsing, chopping, sampler setup, sample-first onboarding, plugin hosting, external mastering, remote AI, cloud sync, accounts, analytics, payments, or background export.

## Context Map

- `src/ui/workstationMixPanels.tsx` renders Master Automation pads and result feedback.
- `src/ui/App.tsx` derives Master Automation pad options, suggested automation Quick Action, and existing undoable automation apply behavior.
- `src/ui/workstationUiModel.ts` owns shared UI model types.
- `README.md` and `docs/product/product.md` describe the direct-composition finish/export workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the readout only from current local arrangement length, current master automation posture, existing pad definitions, and existing pad option data.
- Route the visible decision action only through the existing Master Automation pad apply path.
- This is `plan-588`; the next requested 10-plan progress report is due after `plan-590`.

## Implementation Plan

- [x] Add typed Master Automation Preview and Preview Decision models.
- [x] Render preview and decision readouts near the Master Automation pads.
- [x] Route the visible decision action through the existing Master Automation apply handler and disable it when aligned.
- [x] Update README, product docs, quality rules, and QA expectations.

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
| 2026-06-20 | `git diff --check` | passed |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-20 | `npm run typecheck` | passed |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | passed |
| 2026-06-20 | `npm run build` | passed with existing Vite large-chunk warning |
| 2026-06-20 | `npm run qa` | passed |
| 2026-06-20 | `npm run verify` | passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 style profiles |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | sandbox bind failed with `EPERM`; escalated dev server started |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | sandbox connection failed; escalated curl returned `HTTP/1.1 200 OK` |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | passed; no blockers found after QA |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add visible Master Automation Preview and Decision Readouts. | Master Automation pads already write editable fade events, but users need to inspect the suggested fade posture and explicitly apply it before export without making hidden mastering or sampling central. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-587 completed at about 83.0% progress. |
| 2026-06-20 | harness_builder | Added Master Automation Preview and Preview Decision readouts, current-target Quick Action wiring, direct pad command coverage, and direct-composition documentation/QA expectations. |
| 2026-06-20 | quality_runner | QA, typecheck, quality gate, build, qa, verify, and dev server smoke passed. |
| 2026-06-20 | review_judge | Review completed with no findings; sampling remains secondary and out of this plan. |
