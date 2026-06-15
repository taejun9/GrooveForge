# plan-094-handoff-pack

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Goal

Add a compact Handoff Pack panel that brings WAV, stems, MIDI, and handoff sheet export actions plus their current local status into one explicit deliverable surface.

## Non-Goals

- No new render algorithm, file format, project schema field, or export side effect beyond existing explicit export handlers.
- No auto-export, background render, cloud sync, accounts, analytics, remote AI, remote analysis, plugin hosting, or sampling/imported-audio workflow.
- No LUFS, true-peak, platform compliance, publishing, licensing, or professional mastering guarantee claims.

## Context Map

- `src/ui/App.tsx`: existing export handlers, export/stem analysis, Handoff Sheet generation, Beat Passport placement.
- `src/styles.css`: compact panel/card/button styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: deliverable workflow and guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-094-handoff-pack` and `.worktree/plan-094-handoff-pack` for git repository work.
- Handoff Pack must be explicit click-only and use existing `handleExportWav`, `handleExportStems`, `handleExportMidi`, and `handleExportHandoffSheet` paths.
- Status must derive from local project state, deterministic export analysis, deterministic stem analysis, and Delivery Target only.

## Implementation Plan

- [x] Add Handoff Pack item summary and component.
- [x] Wire the component to existing export handlers.
- [x] Add compact responsive styles.
- [x] Update docs and QA expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Handoff Pack renders four deliverables, buttons are unique, Sheet export button triggers the existing text export path, console errors stay empty, and no horizontal overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that Handoff Pack is explicit, local, status-only until clicked, and does not bypass existing export handlers.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Handoff Pack as a dedicated deliverable surface. | Beginners need a clear final-output area; producers need WAV/stem/MIDI/sheet status and actions in one scan-friendly place. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Handoff Pack. |
| 2026-06-16 | harness_builder | Added Handoff Pack UI, responsive styling, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `npm run verify`, browser smoke, `npm run qa`, and `git diff --check` passed. |

## Completion Notes

Handoff Pack now groups existing WAV, stem, MIDI, and Handoff Sheet export actions in one explicit local deliverable surface. Status is derived from project state, deterministic export/stem analysis, Delivery Target, and Session Brief fields, and each export path remains user-clicked through the existing handlers.
