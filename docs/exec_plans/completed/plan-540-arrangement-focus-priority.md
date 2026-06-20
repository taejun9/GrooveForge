# plan-540-arrangement-focus-priority

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a read-only UI-local Arrangement Focus Priority Readout so beginners know why the current selected block's suggested focus preset is first and working producers can quickly scan the selected block, preset, expected edit scope, and next arrangement check before applying a Focus preset.

## Non-Goals

- Do not change Arrangement Focus preset definitions, suggestion order, apply behavior, Quick Actions command routing, selected-block navigation, arrangement editing semantics, playback scheduling, save/load, export, or project schema.
- Do not mutate project data, undo history, playback, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add sampling, imported audio, remote analysis, AI arrangement, automatic arrangement edits, auto-apply, autoplay, accounts, analytics, cloud sync, onboarding overlays, or tutorials.

## Context Map

- `src/ui/App.tsx` renders Arrangement Focus and derives selected-block preview/result state.
- `src/ui/workstationUiModel.ts` defines Arrangement Focus model types and preset ids.
- `src/styles.css` contains Arrangement Focus layout and preview/result styling.
- `README.md` and `docs/product/product.md` describe Arrangement Focus as local selected-block shaping.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Arrangement Focus behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from the visible Arrangement Focus summary, current preview, selected block state, existing preset definitions, and the current suggested preset.

## Implementation Plan

- [x] Add a typed UI-local Arrangement Focus Priority summary.
- [x] Render the priority readout inside Arrangement Focus with stable test ids and no click handlers.
- [x] Add CSS that keeps the compact priority text contained near the preview/actions.
- [x] Update README, product docs, quality rules, and QA token expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt and escalated retry if sandbox blocks binding.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-20 | `git diff --check` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with existing Vite chunk-size warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed with runtime smoke coverage for 14/14 sample-free blueprints and 14/14 supported style profiles; existing Vite chunk-size warning remains. |
| 2026-06-20 | `npm run dev` | Blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy. |

## Review Plan

QA completes before review starts.

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The readout is derived from existing Arrangement Focus summary/preview state and does not change preset application, Quick Actions routing, undo history, playback, exports, or project schema. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Arrangement Focus Priority Readout. | Arrangement Focus already previews and applies block-shaping presets, but users need one visible reason and next check before changing a selected block. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 539 completed plans, no active plans, and plan-540 is the next 10-plan progress report point. |
| 2026-06-20 | harness_builder | Added UI-local Arrangement Focus Priority summary, readout markup, contained CSS, docs, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed documented QA commands; dev server smoke remained blocked by sandbox localhost binding policy. |
| 2026-06-20 | review_judge | Replaced display-label parsing with a typed preview `changeCount`, then reran QA/typecheck/build/verify. |
