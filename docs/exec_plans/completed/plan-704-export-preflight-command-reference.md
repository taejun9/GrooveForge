# plan-704-export-preflight-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Export Preflight in the Deliver section of Command Reference as a readout-backed delivery-risk entry so users can discover local readiness, mix/master, Master Automation, WAV/stem/MIDI deliverable, and handoff brief checks, the Priority Readout, Export Preflight focus command, direct card commands, and local Focus Result feedback before explicit export.

## Non-Goals

- Do not change Export Preflight scoring, card order, focus target derivation, Priority Readout derivation, visible priority action routing, Quick Actions execution, direct card command routing, Focus Result labels, or disabled-state behavior.
- Do not change Beat Readiness, deterministic export analysis, deterministic stem analysis, Delivery Target, arrangement length, Master Automation posture, Session Brief, Finish Checklist, Review Queue, Handoff Pack, Handoff Sheet, WAV/stem/MIDI export, save/load, snapshots, undo/redo history, playback, or render behavior.
- Do not add auto-export, batch export, background rendering, ZIP/archive creation, upload, platform compliance claims, tutorials, macros, command chains, audio analysis, imported audio, sampling, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Export Preflight summaries, focus routing, priority action, Quick Actions commands, and local Focus Result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-704-export-preflight-command-reference` and `.worktree/plan-704-export-preflight-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add an Export Preflight row to the Deliver Command Reference section as a readout-backed entry.
- [x] Add README/product/quality notes that describe Export Preflight command-map coverage without changing export scoring, files, or focus routing.
- [x] Add harness expectations that pin the row and local-only export-preflight boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Export Preflight scoring, focus routing, export files, remote, and sampling boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Export Preflight as a Deliver Command Reference row. | Export readiness is a critical point where beginners need guardrails and producers need fast send-risk scanning, and the command map should surface the existing local checks without changing export behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Export Preflight Command Reference coverage. |
| 2026-06-25 | harness_builder | Added Export Preflight as a Deliver Command Reference row and pinned README/product/quality/harness coverage without changing export scoring, file contents, or focus routing. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Command Reference/docs/harness coverage and preserved Export Preflight scoring, focus routing, export files, remote, and sampling boundaries. |

## Completion Notes

- Export Preflight now appears in the Deliver Command Reference section as a readout-backed entry.
- README, product, quality, and harness coverage documents the existing readiness, mix/master, Master Automation, WAV/stem/MIDI deliverable, handoff brief checks, Priority Readout, focus command, direct card commands, and local Focus Result feedback.
- No Export Preflight scoring, focus routing, project data, playback, render/export, file contents, remote, or sampling behavior changed.
