# plan-536-hook-readiness-priority

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Hook Readiness Priority Readout so beginners know which hook-quality lane to check first and working producers can quickly scan whether hook section, motif density, arrangement contrast, mix support, or handoff context needs attention before cueing or fixing the hook.

## Non-Goals

- Do not change Hook Readiness card derivation, Focus routing, Hook Loop cue routing, Hook Fix routing, playback scheduling, arrangement editing, pattern editing, mix fixes, save/load, export, or project schema.
- Do not mutate project data, undo history, playback, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add sampling, imported audio, vocal recording, remote analysis, AI arrangement, auto-fills, auto-fixes, accounts, analytics, cloud sync, onboarding overlays, or tutorials.

## Context Map

- `src/ui/App.tsx` renders Hook Readiness cards, focus/cue/fix handlers, and summary derivation.
- `src/ui/workstationUiModel.ts` defines Hook Readiness UI model types.
- `src/styles.css` contains Hook Readiness and compact result styling.
- `README.md` and `docs/product/product.md` describe Hook Readiness as local hook-quality scanning.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Hook Readiness behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from the visible Hook Readiness summary and current highest-priority hook card.

## Implementation Plan

- [x] Add a typed UI-local Hook Readiness Priority summary.
- [x] Render the priority readout near Hook Readiness with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps the compact hook priority text contained.
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
| 2026-06-20 | review_judge | No findings. Priority Readout is UI-local, read-only, and derived from existing Hook Readiness summary/card state. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Hook Readiness Priority Readout. | Hook Readiness already exposes focus, cue, and fix actions, but users need one visible first hook-quality lane before choosing a cue or fix. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 535 completed plans, no active plans, and next regular progress report due at plan-540 completion. |
| 2026-06-20 | harness_builder | Added read-only Hook Readiness Priority Readout derived from the existing highest-priority Hook Readiness card. |
| 2026-06-20 | quality_runner | QA, quality gate, typecheck, build, npm QA, and verify passed; dev server smoke blocked by sandbox EPERM and escalated retry was rejected. |
| 2026-06-20 | review_judge | Review completed with no findings. |
