# plan-534-arrangement-mute-map-priority

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Arrangement Mute Map Priority Readout so beginners know which layer's mute/dropout flow to check first and working producers can quickly scan whether Drums, 808/Bass, Chords, or Synth need arrangement attention before editing block mutes.

## Non-Goals

- Do not change arrangement block mute editing, focus routing, Quick Actions routing, playback scheduling, save/load, export, or project schema.
- Do not mutate project data, undo history, playback, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add sampling, imported audio, remote analysis, AI arrangement, auto-muting, auto-fix loops, accounts, analytics, cloud sync, onboarding overlays, or tutorials.

## Context Map

- `src/ui/App.tsx` renders Arrangement Mute Map lanes and focus result derivation.
- `src/ui/workstationUiModel.ts` defines Arrangement Mute Map UI model types.
- `src/styles.css` contains Arrangement Mute Map and compact readout styling.
- `README.md` and `docs/product/product.md` describe Arrangement Mute Map as local arrangement mute scanning.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce arrangement map behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from existing arrangement blocks and Arrangement Mute Map lane summaries.

## Implementation Plan

- [x] Add a typed UI-local Arrangement Mute Map Priority summary.
- [x] Render the priority readout near the Arrangement Mute Map with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps the compact priority text contained.
- [x] Update README, product docs, quality rules, and QA token expectations.

## QA Plan

- [x] `git diff --check`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run build`
- [x] `npm run qa`
- [x] `npm run verify`
- [x] Dev server smoke attempt and escalated retry if sandbox blocks binding.

## Review Plan

QA completed before review. Review completed with no findings.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Arrangement Mute Map Priority Readout. | Arrangement Mute Map already exposes lanes and focus actions, but users need one visible first layer to audit before editing block mutes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 533 completed plans, no active plans, and next regular progress report due at plan-540 completion. |
| 2026-06-20 | plan_keeper | Implemented a UI-local Arrangement Mute Map Priority Readout and updated documentation plus QA expectations before validation. |
| 2026-06-20 | quality_runner | QA passed for diff check, harness QA, typecheck, quality gate, build, npm QA, and verify; dev server smoke remains blocked by sandbox EPERM on 127.0.0.1:5173, and the escalated retry was rejected by automatic review. |
| 2026-06-20 | review_judge | Reviewed the diff after QA; no findings. The priority readout is display-only and preserves arrangement mute editing, focus routing, Quick Actions, playback, export, and saved project data. |
