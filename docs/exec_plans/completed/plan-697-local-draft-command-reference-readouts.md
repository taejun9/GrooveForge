# plan-697-local-draft-command-reference-readouts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Restore Draft and Clear Draft in the Project section of Command Reference as readout-backed Quick Actions entries so users can discover renderer-local draft recovery, Project Safety Readout context, and Local Draft Recovery Result feedback from the command map.

## Non-Goals

- Do not change local draft storage format, localStorage key/version/size limits, parser behavior, Restore Draft behavior, Clear Draft behavior, or visible local draft banner behavior.
- Do not change Project Safety Readout, Project File Result, Local Draft Recovery Result, save/open/import/download behavior, file dialogs, or `.grooveforge.json` serialization.
- Do not change project schema, undo/redo history payloads, realtime playback, render/export, MIDI export, Handoff Pack, Handoff Sheet, snapshots, or current project data outside explicit Restore Draft clicks.
- Do not add autosave, file versioning, destructive filesystem actions, cloud sync, accounts, analytics, remote AI, sampling, imported audio, sample-pack workflows, macros, command chains, autoplay, or auto-export.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Restore Draft, Clear Draft, Project Safety Readout, Project File Result, and Local Draft Recovery Result behavior.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-697-local-draft-command-reference-readouts` and `.worktree/plan-697-local-draft-command-reference-readouts` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Restore Draft Project Command Reference row to `Quick Actions / Readout`.
- [x] Change the Clear Draft Project Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe local draft command-map coverage without expanding project-file scope.
- [x] Add harness expectations that pin both rows and local-only recovery boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Restore Draft, Clear Draft, Project Safety Readout, Project File Result, Local Draft Recovery Result, save/open, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Restore Draft and Clear Draft as readout-backed Command Reference rows. | Local draft recovery already combines explicit Project-scope commands, safety readout context, and result feedback; the command map should surface that safety loop for beginners and active producer sessions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for local draft Command Reference readout coverage. |
| 2026-06-25 | harness_builder | Marked Restore Draft and Clear Draft as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing local draft recovery behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Command Reference/docs/harness coverage and preserved local draft, project file, playback/export, remote, and sampling boundaries. |

## Completion Notes

- Restore Draft and Clear Draft now appear in Command Reference as `Quick Actions / Readout` Project rows.
- README, product, quality, and harness coverage document that this is discovery/readout coverage for existing renderer-local draft recovery, Project Safety Readout context, and Local Draft Recovery Result feedback.
- No Restore Draft, Clear Draft, local draft storage, parser, Project Safety Readout, Project File Result, Local Draft Recovery Result, save/open/import/download, project schema, playback, render/export, remote, or sampling behavior changed.
