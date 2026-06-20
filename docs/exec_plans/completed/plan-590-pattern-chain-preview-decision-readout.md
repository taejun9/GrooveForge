# plan-590-pattern-chain-preview-decision-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a UI-local Pattern Chain Preview Decision Readout so the currently suggested chain/expand action exposes readiness, Pattern A/B/C sequence scope, structural change count, and an explicit Apply Suggested Chain action before users commit 8-bar sketch or expanded song-form arrangement changes.

## Non-Goals

- Do not change Pattern Chain definitions, Chain Expand behavior, arrangement block schema, playback scheduling, export, MIDI, snapshots, local draft recovery, undo semantics, Arrangement Template, Arrangement Arc, Arrangement Focus, Section Locator, Delivery Target, or Handoff behavior.
- Do not auto-apply Pattern Chain actions, autoplay, auto-export, chain multiple commands, or persist preview/decision state in project data, localStorage, or undo history.
- Do not add imported audio, recording, sample browsing, chopping, sampler setup, sample-first onboarding, plugin hosting, remote AI, cloud sync, accounts, analytics, payments, or background export.

## Context Map

- `src/ui/App.tsx` renders Pattern Chain preview/priority/result controls and routes Pattern Chain apply/expand behavior.
- `src/ui/workstationUiModel.ts` owns shared UI model types.
- `src/styles.css` owns Pattern Chain preview/priority/result styling.
- `README.md` and `docs/product/product.md` describe the direct-composition arrangement workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the readout only from the current local arrangement, existing Pattern Chain/Chain Expand transforms, and existing preview summary data.
- Route the visible decision action only through the existing Pattern Chain apply or Chain Expand handler.
- This is `plan-590`; the requested 10-plan progress report is due after this plan completes.

## Implementation Plan

- [x] Add typed Pattern Chain Preview Decision model.
- [x] Render the preview decision readout near the Pattern Chain preview/priority controls.
- [x] Route the visible decision action through the existing Pattern Chain apply/expand handler and disable it when aligned.
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
| 2026-06-20 | `npm run verify` | passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 supported style profiles |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | sandbox attempt failed with expected `listen EPERM`; approved local dev server started |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | sandbox attempt could not connect; approved HEAD request returned `HTTP/1.1 200 OK` |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | no blockers; Pattern Chain Preview Decision stays UI-local, routes through existing Pattern Chain apply/expand handling, and keeps sampling secondary |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add visible Pattern Chain Preview Decision Readout. | Pattern Chain preview/priority/result already support direct arrangement sketches, but users need a pre-apply decision readout that names the suggested chain or expand action and change scope without turning arrangement into sampling or imported-audio work. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-589 completed at about 84.0% progress. |
| 2026-06-20 | harness_builder | Added the typed Pattern Chain Preview Decision summary, visible readout, existing handler routing, responsive styling, and matching docs/QA expectations. |
| 2026-06-20 | quality_runner | Completed QA, build, verify/runtime smoke, and dev server smoke. |
| 2026-06-20 | review_judge | Reviewed the completed changes with no blockers and confirmed direct beat composition remains primary. |
