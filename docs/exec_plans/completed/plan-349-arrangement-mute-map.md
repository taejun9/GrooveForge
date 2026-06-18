# plan-349-arrangement-mute-map

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue working toward a desktop beat workstation that can satisfy working producers while staying usable for beginners.

## Goal

Add an Arrangement Mute Map: a UI-local, read-only arrangement scan that shows where Drums, 808/Bass, Chords, and Synth are muted across song sections, gives producers a fast drop/build/space check, gives beginners plain-language structure cues, and exposes focus-only Quick Actions that jump back to Arrange.

## Non-Goals

- Do not change arrangement mute semantics, project schema, playback, render, WAV/stem/MIDI export, or save/load behavior.
- Do not add auto-arrangement, hidden generation, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.
- Do not create audio files, batch exports, ZIPs, or filesystem automation.

## Context Map

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep the feature UI-local and read-only except existing focus state/result feedback.

## Implementation Plan

- [x] Inspect current arrangement, mute, summary, and Quick Actions patterns.
- [x] Add Arrangement Mute Map model derivation and UI inside the Arrangement surface.
- [x] Add focus-only Quick Actions for the map and its lane cards.
- [x] Update docs and QA expectations.
- [x] Run QA, review, move plan to completed, and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify the map derives only from existing arrangement mute data, uses focus-only navigation, and does not mutate project data or alter playback/export semantics.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Arrangement Mute Map as read-only UI-local guidance. | It improves arrangement scanning for producers and explains section-layer space to beginners without risky schema or audio changes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-349-arrangement-mute-map`. |
| 2026-06-18 | harness_builder | Added Arrangement Mute Map UI derivation, focus-only Quick Actions, responsive CSS, product docs, and QA expectations. |
| 2026-06-18 | quality_runner | `run_qa.py`, typecheck, and production build passed; localhost and file-based browser checks were blocked by sandbox/browser policy, so visual verification remains limited to automated build outputs. |
| 2026-06-18 | review_judge | Reviewed the change after QA; no blocking findings. |

## Completion Notes

Completed Arrangement Mute Map as a UI-local read-only Arrange surface. The map derives from existing arrangement muted tracks, bar spans, sections, Pattern assignments, and playback index; Quick Actions only focus Arrange lanes and do not mutate project data. QA passed. Browser visual verification was attempted but blocked by localhost sandbox and in-app Browser URL policy.
