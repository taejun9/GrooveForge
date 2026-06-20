# plan-539-section-locator-priority

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Section Locator Priority Readout so beginners know which song section to cue first and working producers can quickly scan whether the current section cue should prioritize the playing block, selected block, Hook, or the first available song section before editing arrangement details.

## Non-Goals

- Do not change Section Locator pad derivation, cue routing, selected-block navigation, block-loop state, playback scheduling, arrangement editing, save/load, export, or project schema.
- Do not mutate project data, undo history, playback, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add sampling, imported audio, remote analysis, AI arrangement, automatic section selection, autoplay, auto-scrolling, accounts, analytics, cloud sync, onboarding overlays, or tutorials.

## Context Map

- `src/ui/App.tsx` renders Section Locator Pads and derives local cue pads from arrangement blocks.
- `src/ui/workstationUiModel.ts` defines Section Locator pad model types.
- `src/styles.css` contains Section Locator layout and playing-state styling.
- `README.md` and `docs/product/product.md` describe Section Locator as local section cueing.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Section Locator behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from visible Section Locator pads, selected section state, and playing section state.

## Implementation Plan

- [x] Add a typed UI-local Section Locator Priority summary.
- [x] Render the priority readout inside Section Locator with stable test ids and no click handlers.
- [x] Add CSS that keeps the compact priority text contained above the section pads.
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
| 2026-06-20 | `npm run verify` | Passed with existing Vite chunk-size warning. |
| 2026-06-20 | `npm run dev` | Blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy. |

## Review Plan

QA completes before review starts.

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The readout is derived from visible local Section Locator pad state and does not change cue handlers, playback scheduling, undo history, exports, or project schema. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Section Locator Priority Readout. | Section Locator already cues sections, but users need one visible audition target before deciding which section to hear or edit next. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 538 completed plans, no active plans, and next regular progress report due at plan-540 completion. |
| 2026-06-20 | harness_builder | Added UI-local Section Locator Priority summary, readout markup, contained CSS, docs, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed documented QA commands; dev server smoke remained blocked by sandbox localhost binding policy. |
| 2026-06-20 | review_judge | Reviewed post-QA diff with no follow-up findings. |
