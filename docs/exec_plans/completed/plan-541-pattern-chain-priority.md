# plan-541-pattern-chain-priority

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a read-only UI-local Pattern Chain Priority Readout so beginners know which Pattern Chain or Chain Expand action to consider first and working producers can quickly scan the recommended action, A/B/C sequence, arrangement scope, expected move count, and next check before changing the song outline.

## Non-Goals

- Do not change Pattern Chain definitions, Chain Expand transforms, step editor behavior, apply behavior, Quick Actions command routing, arrangement editing semantics, playback scheduling, save/load, export, or project schema.
- Do not mutate project data, undo history, playback, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add sampling, imported audio, remote analysis, AI arrangement, automatic arrangement edits, auto-apply, autoplay, accounts, analytics, cloud sync, onboarding overlays, or tutorials.

## Context Map

- `src/ui/App.tsx` renders Pattern Chain Preview, actions, step editor, and result state.
- `src/ui/workstationUiModel.ts` defines Pattern Chain preview and result model types.
- `src/styles.css` contains Pattern Chain preview/result/action styling.
- `README.md` and `docs/product/product.md` describe Pattern Chain as local arrangement sketching.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Pattern Chain behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from the visible Pattern Chain preview and current local arrangement state.

## Implementation Plan

- [x] Add a typed UI-local Pattern Chain Priority summary.
- [x] Render the priority readout near Pattern Chain Preview with stable test ids and no click handlers.
- [x] Add CSS that keeps the compact priority text contained across desktop and mobile layouts.
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
| 2026-06-20 | review_judge | No findings. Confirmed the Priority Readout is read-only, UI-local, and derived from Pattern Chain Preview/current arrangement state without changing apply, expand, step editor, playback, export, save/load, or schema behavior. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Pattern Chain Priority Readout. | Pattern Chain already previews arrangement rewrites, but users need one visible reason and next check before converting a loop into song form. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 540 completed plans, no active plans, and next regular progress report due at plan-550 completion. |
| 2026-06-20 | harness_builder | Added UI-local Pattern Chain Priority summary, readout markup, contained CSS, docs, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed documented QA commands; dev server smoke remained blocked by sandbox localhost binding policy. |
| 2026-06-20 | review_judge | Reviewed targeted code, CSS, docs, and harness expectations; no follow-up changes required. |
