# plan-587-space-fx-preview-decision-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a UI-local Space FX Preview Decision Readout so the current suggested send posture exposes readiness, affected stem send scope, and an explicit Apply Suggested Space action before users commit built-in room/wide/wash send changes.

## Non-Goals

- Do not change Space FX pad definitions, send processing, Mix Balance behavior, Stem Audition behavior, Mix Coach behavior, mixer schema, playback scheduling, export, render, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not auto-apply Space FX pads, auto-play, change the suggested space posture without local mixer send changes, hide existing Space FX pad buttons, or trigger more than one Space FX operation from one action.
- Do not add imported audio, reference-track upload, audio analysis, sample browsing, chopping, sampler setup, sample-first onboarding, remote AI, cloud sync, accounts, analytics, payments, plugin hosting, external reverb plugins, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Space FX preview/decision state in project data, localStorage, or undo history.

## Context Map

- `src/ui/workstationMixPanels.tsx` renders Space FX pad controls and Space FX Result inside the Mix panel.
- `src/ui/App.tsx` derives `SpaceFxPadOption` values and routes existing undoable Space FX pad apply behavior.
- `src/ui/workstationUiModel.ts` owns UI model types shared by workstation panels.
- `README.md` and `docs/product/product.md` describe the direct-composition mix workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the readout only from current local mixer send state, existing Space FX Pad definitions, and existing Space FX pad option data.
- Route the visible decision action only through the existing Space FX pad apply path.
- This is `plan-587`; the next requested 10-plan progress report is due after `plan-590`.

## Implementation Plan

- [x] Add typed Space FX Preview and Preview Decision models.
- [x] Render the preview and decision readout near the Space FX pads.
- [x] Route the visible decision action through the existing Space FX apply handler and disable it when aligned.
- [x] Update README, product docs, quality rules, and QA expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt and Browser preview if tooling is available.

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
| 2026-06-20 | Add visible Space FX Preview and Decision Readouts. | Space FX Pads already apply built-in send postures, but beginners and producers need to see which space move is suggested and explicitly commit it without making imported audio, plugins, or sampling central. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and the next 10-plan progress report is due after plan-590. |
| 2026-06-20 | harness_builder | Added Space FX Preview and Preview Decision readouts, current-target Quick Action, guarded direct pad commands, responsive styling, and direct-composition documentation/QA expectations. |
| 2026-06-20 | quality_runner | QA, typecheck, quality gate, build, qa, verify, and dev server smoke passed. |
| 2026-06-20 | review_judge | Review completed with no findings; sampling remains secondary and out of this plan. |
