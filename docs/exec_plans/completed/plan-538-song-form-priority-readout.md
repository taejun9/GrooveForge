# plan-538-song-form-priority-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Song Form Priority Readout so beginners know which arrangement-form lane to check first and working producers can quickly scan whether section flow, Pattern A/B/C spread, selected block posture, or energy arc needs attention before editing arrangement blocks.

## Non-Goals

- Do not change Song Form metric derivation, segment derivation, selected-block navigation, arrangement editing, arrangement playback, Section Locator, Arrangement Focus, save/load, export, or project schema.
- Do not mutate project data, undo history, playback, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add sampling, imported audio, remote analysis, AI arrangement, automatic song-form rewriting, auto-scrolling, autoplay, accounts, analytics, cloud sync, onboarding overlays, or tutorials.

## Context Map

- `src/ui/App.tsx` renders Song Form Overview metrics, timeline segments, and selected/playing block context.
- `src/ui/workstationUiModel.ts` defines Song Form Overview model types.
- `src/styles.css` contains Song Form Overview metric and segment styling.
- `README.md` and `docs/product/product.md` describe Song Form Overview as local arrangement navigation.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Song Form behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from the visible Song Form Overview summary and current highest-priority song-form metric.

## Implementation Plan

- [x] Add a typed UI-local Song Form Priority summary.
- [x] Render the priority readout inside Song Form Overview with stable test ids and no click handlers.
- [x] Add CSS that keeps the compact priority text contained inside the metrics column.
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

## Review Plan

QA completes before review starts.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-20 | `git diff --check` | passed |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-20 | `npm run typecheck` | passed |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | passed |
| 2026-06-20 | `npm run build` | passed with existing Vite chunk-size warning |
| 2026-06-20 | `npm run qa` | passed |
| 2026-06-20 | `npm run verify` | passed |
| 2026-06-20 | `npm run dev` | blocked by sandbox: `listen EPERM: operation not permitted 127.0.0.1:5173` |
| 2026-06-20 | escalated `npm run dev` retry | rejected by environment review; no workaround attempted |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. Priority Readout is UI-local, read-only, and derived from existing Song Form metrics. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Song Form Priority Readout. | Song Form already shows metrics and segment navigation, but users need one visible first arrangement-form lane before editing blocks or applying arrangement moves. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 537 completed plans, no active plans, and next regular progress report due at plan-540 completion. |
| 2026-06-20 | harness_builder | Added read-only Song Form Priority Readout derived from the existing highest-priority Song Form metric. |
| 2026-06-20 | quality_runner | QA, quality gate, typecheck, build, npm QA, and verify passed; dev server smoke blocked by sandbox EPERM and escalated retry was rejected. |
| 2026-06-20 | review_judge | Review completed with no findings. |
