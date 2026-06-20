# plan-589-arrangement-template-preview-decision-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a UI-local Arrangement Template Preview Decision Readout so the currently suggested song-form template exposes readiness, section/pattern scope, structural change count, and an explicit Apply Suggested Template action before users commit Intro/Verse/Hook/Outro structure changes.

## Non-Goals

- Do not change arrangement template definitions, arrangement block schema, playback scheduling, export, MIDI, snapshots, local draft recovery, undo semantics, Arrangement Arc, Arrangement Focus, Pattern Chain, Section Locator, Delivery Target, or Handoff behavior.
- Do not auto-apply templates, autoplay, auto-export, chain multiple commands, or persist preview/decision state in project data, localStorage, or undo history.
- Do not add imported audio, recording, sample browsing, chopping, sampler setup, sample-first onboarding, plugin hosting, remote AI, cloud sync, accounts, analytics, payments, or background export.

## Context Map

- `src/ui/App.tsx` renders Arrangement Template controls and derives preview/priority/result summaries.
- `src/ui/workstationUiModel.ts` owns shared UI model types.
- `README.md` and `docs/product/product.md` describe the direct-composition arrangement workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the readout only from the current local arrangement, existing arrangement template definitions, and existing preview summary data.
- Route the visible decision action only through the existing Arrangement Template apply path.
- This is `plan-589`; the next requested 10-plan progress report is due after `plan-590`.

## Implementation Plan

- [x] Add typed Arrangement Template Preview Decision model.
- [x] Render the preview decision readout near the Arrangement Template preview/priority controls.
- [x] Route the visible decision action through the existing Arrangement Template apply handler and disable it when aligned.
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
| 2026-06-20 | Add visible Arrangement Template Preview Decision Readout. | Arrangement Template preview/priority/result already support direct song-form edits, but users need a pre-apply decision readout that names the suggested structure and change scope without turning arrangement into sampling or imported-audio work. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-588 completed at about 83.5% progress. |
| 2026-06-20 | harness_builder | Added Arrangement Template Preview Decision readout, current-target Quick Action decision wiring, responsive styling, and direct-composition documentation/QA expectations. |
| 2026-06-20 | quality_runner | QA, typecheck, quality gate, build, qa, verify, and dev server smoke passed. |
| 2026-06-20 | review_judge | Review completed with no findings; sampling remains secondary and out of this plan. |
