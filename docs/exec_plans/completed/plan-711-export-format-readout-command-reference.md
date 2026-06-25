# plan-711-export-format-readout-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Clarify and pin Export Format Readout in the Deliver section of Command Reference so users can discover the existing WAV format, duration, full-mix filename, stem count, MIDI scope, Handoff Sheet context, focus command, direct metric commands, and Handoff Pack follow-up without exporting files, changing export-format derivation, changing export handlers, or expanding sampling scope.

## Non-Goals

- Do not change Export Format Readout metric derivation, Export Format Focus routing, direct metric commands, deterministic export analysis, deterministic stem analysis, arrangement length analysis, filename helpers, Delivery Target, Session Brief use, Handoff Pack status, export handlers, file names, file contents, render bytes, MIDI bytes, Handoff Sheet contents, or download behavior.
- Do not change Handoff Pack route readout, file manifest, Manifest Audit, Send Order, latest receipt state, Handoff Package Check, Handoff Next Export, direct export result metrics, save/load, snapshots, undo/redo history, realtime playback, WAV/stem/MIDI export, or project schema.
- Do not add configurable render settings, dither, normalization, auto-export, batch export, retries, zip packaging, native folder writing, background rendering, uploads, platform compliance, publishing/licensing claims, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows and already lists Export Format Readout in the Deliver section.
- `src/ui/App.tsx` owns Export Format Readout metrics, focus routing, Handoff Pack status, receipt state, and export handlers.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-711-export-format-readout-command-reference` and `.worktree/plan-711-export-format-readout-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add README/product/quality notes that describe Export Format Readout command-map coverage without changing export-format derivation or export behavior.
- [x] Add harness expectations that pin the existing Deliver row and local-only Export Format Readout command-reference boundaries.
- [x] Verify the change stays limited to documentation and harness coverage.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Export Format Readout derivation, focus routing, Handoff Pack status, export handlers, project data, playback, export outputs, remote, and sampling boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Clarify Export Format Readout as a Deliver Command Reference readout. | Beginners need to find export-format context before choosing deliverables, and producers need a fast format/stem/MIDI/sheet check without triggering exports or changing file behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Export Format Readout Command Reference coverage. |
| 2026-06-25 | harness_builder | Added README, product, quality, and harness coverage for Export Format Readout Command Reference discoverability while preserving export-format derivation, export handlers, playback, export output, and sampling boundaries. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Export Format Readout Command Reference/docs/harness coverage and preserved export-format derivation, focus routing, Handoff Pack status, export handlers, project data, playback, export output, remote, and sampling boundaries. |

## Completion Notes

- README, product, quality, and harness coverage now pin Export Format Readout command-map discoverability for WAV sample-rate/channel format, duration, full-mix filename, stem count/audible stems, MIDI scope, Handoff Sheet context, focus command, direct metric commands, and Handoff Pack follow-up.
- Harness coverage also pins the existing Deliver Command Reference row for Export Format Readout as `Quick Actions / Readout`.
- No Export Format Readout metric derivation, focus routing, deterministic export/stem analysis, export handlers, file contents, playback, render/export, project schema, remote, or sampling behavior changed.
