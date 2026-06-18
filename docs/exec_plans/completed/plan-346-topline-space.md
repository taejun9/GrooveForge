# plan-346-topline-space

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working producers while staying clear for beginners. Keep sampling secondary and do not let optional sampling become the product center.

## Goal

Add a UI-local Topline Space check that helps producers and beginners see whether the current beat leaves usable room for a vocal, topline, or lead hook. The check should derive from existing pattern density, hook arrangement, mix/export posture, Delivery Target, and Session Brief data, then provide Focus controls and Quick Actions that jump to existing Compose, Arrange, Mix, Master, or Deliver panels.

## Non-Goals

- No sampling, imported audio, reference-track upload, vocal recording, stem separation, waveform analysis, or audio analysis beyond existing deterministic local export/stem summaries.
- No remote AI, cloud sync, accounts, analytics, payments, or plugin hosting.
- No saved project schema changes and no automatic rewriting of musical events, arrangement, mixer, master, or export data.
- No autoplay, auto-export, modal tutorial, or command-chain behavior.

## Context Map

- `src/ui/App.tsx` owns the workstation surface, read-only production panels, focus handlers, and Quick Actions definitions.
- `src/ui/workstationUiModel.ts` holds UI model types for read-only summaries and focus card data.
- `src/styles.css` holds compact workstation panel and diagnostic card styling.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` document the product surface and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition across genres; sampling remains a later optional extension only.

## Implementation Plan

- [x] Inspect existing Hook Readiness, Listening Pass, Production Snapshot, and Quick Actions focus patterns.
- [x] Add Topline Space UI model types and derived summary data from local project/readiness/export/brief state.
- [x] Add a Topline Space panel with focus buttons that route only to existing workstation panels.
- [x] Add Quick Actions for the current Topline Space focus and each visible Topline Space card.
- [x] Document the feature and QA guardrails.
- [x] Run QA before review.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run build`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`

Browser smoke if environment allows localhost: Topline Space renders near existing read-only production checks, current focus command and card commands appear in Quick Actions, focus jumps go only to Compose/Arrange/Mix/Master/Deliver, no project data changes occur from focus actions, and no console errors appear.

## Review Plan

QA completes before review starts. Review checks that Topline Space derives only from local existing state, stays UI-local, focuses rather than mutates, preserves sampling-secondary positioning, keeps first-run beat-making centered, and avoids remote/audio-analysis scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add a Topline Space read-only check before any sampling work. | Vocal/topline room is useful to professional producers and beginners, and it reinforces composition, arrangement, mix, and handoff quality without making sampling central. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for Topline Space. |
| 2026-06-18 | harness_builder | Added the Topline Space UI, focus routing, Quick Actions, docs, and harness expectations. |
| 2026-06-18 | quality_runner | Ran typecheck, harness QA, diff check, build, quality gate, `npm run qa`, and `npm run verify`; all passed. |
| 2026-06-18 | review_judge | Reviewed Topline Space for UI-local derivation, focus-only actions, sampling-secondary positioning, and remote/audio-analysis boundaries; no findings. |
| 2026-06-18 | doc_gardener | Prepared completion move and review mirror after QA and review completed. |

## Completion Notes

Topline Space is complete as a local read-only workstation check. It surfaces Pocket, Lead Room, Vocal Window, Headroom, and Artist Cue cards from existing arrangement, pattern, readiness, export, Delivery Target, and Session Brief data; Quick Actions and card controls only focus existing Compose, Arrange, Mix, Master, or Deliver panels.

Validation passed with `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, and `npm run verify`. Browser smoke was not run because the Browser tool was not exposed in this session; the build produced the existing non-failing Vite chunk-size warning.
