# plan-592-arrangement-arc-preview-decision-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a UI-local Arrangement Arc Preview Decision Readout so the currently suggested full-song arc exposes readiness, section/pattern scope, energy/mute posture, change count, and an explicit Apply Suggested Arc action before users commit full-arrangement energy/section shaping.

## Non-Goals

- Do not change Arrangement Arc pad definitions, apply transforms, arrangement block schema, Pattern Chain, Arrangement Template, Arrangement Focus, Section Locator, Song Form Overview, playback scheduling, export, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not auto-apply Arrangement Arc actions, autoplay, auto-export, chain multiple commands, or persist preview/decision state in project data, localStorage, or undo history.
- Do not add imported audio, recording, sample browsing, chopping, sampler setup, sample-first onboarding, plugin hosting, remote AI, cloud sync, accounts, analytics, payments, or background export.

## Context Map

- `src/ui/App.tsx` renders Arrangement Arc preview/priority/result controls and routes Arrangement Arc apply behavior.
- `src/ui/workstationUiModel.ts` owns shared UI model types.
- `src/styles.css` owns Arrangement Arc styling.
- `README.md` and `docs/product/product.md` describe the direct-composition arrangement workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the readout only from current local arrangement state, existing Arrangement Arc preview summary data, and existing Arrangement Arc transforms.
- Route the visible decision action only through the existing Arrangement Arc apply handler.

## Implementation Plan

- [x] Add typed Arrangement Arc Preview Decision model.
- [x] Render the preview decision readout near the existing Arrangement Arc preview/priority controls.
- [x] Route the visible decision action through the existing Arrangement Arc apply handler and disable it when the suggested arc is already aligned.
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
| 2026-06-20 | review_judge | no blockers; Arrangement Arc Preview Decision stays UI-local, routes through the existing arc apply handler, and keeps sampling secondary |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add visible Arrangement Arc Preview Decision Readout. | Arrangement Arc preview/priority/result already support full-song shaping, but users need a pre-apply decision readout that names the suggested arc and change scope without turning arrangement into sampling or imported-audio work. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-591 completed at about 85.0% progress. |
| 2026-06-20 | harness_builder | Added the typed Arrangement Arc Preview Decision summary, visible readout, existing apply-handler routing, responsive styling, and matching docs/QA expectations. |
| 2026-06-20 | quality_runner | Completed QA, build, verify/runtime smoke, and dev server smoke. |
| 2026-06-20 | review_judge | Reviewed the completed changes with no blockers and confirmed direct beat composition remains primary. |
