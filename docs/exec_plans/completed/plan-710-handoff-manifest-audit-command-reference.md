# plan-710-handoff-manifest-audit-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Clarify and pin Handoff Manifest Audit in the Deliver section of Command Reference so users can discover the existing planned-file readiness readout, latest receipt context, next missing delivery step, focus command, and Handoff Pack follow-up without exporting files, changing manifest derivation, changing export handlers, or expanding sampling scope.

## Non-Goals

- Do not change Handoff Pack item statuses, file manifest derivation, Manifest Audit readiness derivation, latest receipt state, next-step derivation, Handoff Manifest Audit focus routing, Handoff Send Order, Handoff Package Check, Handoff Next Export, export handlers, file names, file contents, render bytes, MIDI bytes, Handoff Sheet contents, or download behavior.
- Do not change Handoff Pack route readout, Export Format Readout, Export Preflight, Handoff Export Receipt, direct export result metrics, save/load, snapshots, undo/redo history, realtime playback, WAV/stem/MIDI export, or project schema.
- Do not add auto-export, batch export, retries, zip packaging, native folder writing, background rendering, media uploads, platform compliance, publishing/licensing claims, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows and already lists Handoff Manifest Audit in the Deliver section.
- `src/ui/App.tsx` owns Manifest Audit derivation, Handoff Manifest Audit focus routing, Handoff Pack status, receipt state, and export handlers.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-710-handoff-manifest-audit-command-reference` and `.worktree/plan-710-handoff-manifest-audit-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add README/product/quality notes that describe Handoff Manifest Audit command-map coverage without changing manifest derivation or export behavior.
- [x] Add harness expectations that pin the existing Deliver row and local-only Handoff Manifest Audit command-reference boundaries.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Manifest Audit derivation, focus routing, Handoff Pack status, export handlers, project data, playback, export outputs, remote, and sampling boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Clarify Handoff Manifest Audit as a Deliver Command Reference readout. | Beginners need to find planned-file readiness before sending, and producers need a fast manifest check without triggering exports or changing file behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Handoff Manifest Audit Command Reference coverage. |
| 2026-06-25 | harness_builder | Added README, product, quality, and harness coverage for Handoff Manifest Audit Command Reference discoverability while preserving manifest derivation, export handlers, playback, export output, and sampling boundaries. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Handoff Manifest Audit Command Reference/docs/harness coverage and preserved manifest derivation, focus routing, Handoff Pack status, export handlers, project data, playback, export output, remote, and sampling boundaries. |

## Completion Notes

- README, product, quality, and harness coverage now pin Handoff Manifest Audit command-map discoverability for planned WAV/stem/MIDI/Handoff Sheet file readiness, latest receipt context, next missing delivery step, focus command, and Handoff Pack follow-up.
- Harness coverage also pins the existing Deliver Command Reference row for Handoff Manifest Audit as `Quick Actions / Readout`.
- No Handoff Pack status derivation, file manifest derivation, Manifest Audit readiness derivation, focus routing, export handlers, file contents, playback, render/export, project schema, remote, or sampling behavior changed.
