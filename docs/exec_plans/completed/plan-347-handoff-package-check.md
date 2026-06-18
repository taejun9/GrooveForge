# plan-347-handoff-package-check

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a UI-local Handoff Package Check inside the Handoff Pack so users can see whether the explicit WAV, stems, MIDI, and Handoff Sheet deliverables form a coherent send package. The check should derive only from existing local export/stem/brief/receipt/target state, show package status and file-set readiness, and provide Focus controls plus Quick Actions that route to the existing Deliver panel without exporting, saving, mutating project data, or creating a ZIP/archive.

## Non-Goals

- No ZIP/archive creation, native folder writing, batch export, auto-export, or background filesystem automation.
- No changes to WAV, stem, MIDI, Handoff Sheet, save/load, project schema, undo history, playback, mixer, master, or render output semantics.
- No sampling, imported audio, reference-track upload, vocal recording, stem separation, waveform analysis, remote AI, cloud sync, accounts, analytics, payments, or plugin hosting.
- No command chains, macros, autoplay, or modal tutorial behavior.

## Context Map

- `src/ui/App.tsx` owns Handoff Pack rendering, export receipt state, Quick Actions, and local summary derivation.
- `src/ui/workstationUiModel.ts` holds UI model types for Handoff and focus card data.
- `src/styles.css` holds Handoff Pack/readout styling.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` document behavior and QA guardrails.
- `harness/scripts/run_qa.py` enforces docs/source expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition across genres; sampling remains a later optional extension only.

## Implementation Plan

- [x] Inspect current Handoff Pack items, Send Order, Manifest Audit, Export Receipt, and Quick Actions patterns.
- [x] Add Handoff Package Check UI model types and derive cards from local deliverable, target, receipt, and brief state.
- [x] Render the Package Check inside Handoff Pack with Focus controls that route only to Deliver.
- [x] Add Quick Actions for Package Check focus/card commands that reuse the same focus handler and produce UI-local result feedback.
- [x] Document the feature and add quality/harness guardrails.
- [x] Run QA before review.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run build`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`

Browser smoke if environment allows localhost: Handoff Package Check renders in Handoff Pack, current focus and direct card commands appear in Quick Actions, Focus controls jump only to Deliver, no downloads or project mutations occur from focus actions, and no console errors appear.

## Review Plan

QA completes before review starts. Review checks that Package Check derives only from local existing state, stays UI-local, focuses rather than exports/mutates, preserves sampling-secondary positioning, keeps direct beat-making/export centered, and avoids ZIP/archive/native filesystem scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add a Handoff Package Check before archive export work. | Producers need confidence that files are send-ready, while beginners need a readable packaging checklist; a read-only check improves delivery quality without adding risky batch export or native filesystem scope. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for Handoff Package Check. |
| 2026-06-18 | harness_builder | Added Handoff Package Check UI, focus handler, Quick Actions, result metrics/follow-up text, docs, and harness expectations. |
| 2026-06-18 | quality_runner | Ran typecheck, harness QA, diff check, build, quality gate, `npm run qa`, and `npm run verify`; all passed. |
| 2026-06-18 | review_judge | Reviewed the feature for UI-local derivation, focus-only behavior, export-handler preservation, and no ZIP/archive or sampling scope; no findings. |
| 2026-06-18 | doc_gardener | Prepared completion move and review mirror after QA and review completed. |

## Completion Notes

Handoff Package Check is complete as a UI-local Handoff Pack readiness scan. It derives File Set, Export Order, Latest Export, and Session Context cards from existing local Handoff Pack item status, file manifest, Send Order, latest explicit Handoff Export Receipt, selected Delivery Target, Session Brief, deterministic export analysis, and deterministic stem analysis. Visible Focus controls plus Quick Actions Handoff Package focus/card commands route only to Deliver and do not export, save, mutate project data, create ZIP archives, batch export, or write native folders.

Validation passed with `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, and `npm run verify`. Browser smoke was not run because the Browser tool was not exposed in this session; the build produced the existing non-failing Vite chunk-size warning.
