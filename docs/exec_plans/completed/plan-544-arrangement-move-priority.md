# plan-544-arrangement-move-priority

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a read-only UI-local Arrangement Move Priority Readout so beginners can see which selected-block Drop, Build, Hook Lift, or Reset move to consider first and working producers can scan selected block scope, energy/mute impact, and next listening check before changing a block.

## Non-Goals

- Do not change Arrangement Move preset definitions, apply behavior, Quick Actions command routing, arrangement editing semantics, playback scheduling, save/load, export, or project schema.
- Do not mutate project data, undo history, playback, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add sampling, imported audio, remote analysis, AI arrangement, automatic arrangement edits, auto-apply, autoplay, accounts, analytics, cloud sync, onboarding overlays, or tutorials.

## Context Map

- `src/ui/App.tsx` renders selected arrangement block controls, Arrangement Move buttons, and Quick Action target selection.
- `src/ui/workstationUiModel.ts` defines shared UI model types.
- `src/styles.css` contains Arrangement Move button styling.
- `README.md` and `docs/product/product.md` describe Arrangement Move as selected-block energy/mute shaping.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Arrangement Move behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from selected arrangement block state and existing Arrangement Move preset definitions.

## Implementation Plan

- [x] Add a typed UI-local Arrangement Move Priority summary.
- [x] Render the priority readout near Arrangement Move buttons with stable test ids and no click handlers.
- [x] Add CSS that keeps compact priority text contained across desktop and mobile layouts.
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
| 2026-06-20 | review_judge | No findings. The readout is derived from selected block state and existing Arrangement Move preset definitions, stays UI-local, and does not alter apply handlers, project schema, playback, export, or undo behavior. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Arrangement Move Priority Readout. | Selected-block Arrangement Move actions already exist, but users need one visible reason and next listening check before changing energy and mutes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 543 completed plans, no active plans, and next regular progress report due at plan-550 completion. |
| 2026-06-20 | harness_builder | Added UI-local Arrangement Move Priority summary, readout markup, contained CSS, docs, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed documented QA commands; dev server smoke remained blocked by sandbox localhost binding policy. |
