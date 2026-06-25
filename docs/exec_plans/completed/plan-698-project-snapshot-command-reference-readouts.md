# plan-698-project-snapshot-command-reference-readouts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Project Snapshots and Snapshot Compare in the Project section of Command Reference as readout-backed Quick Actions entries so users can discover local idea slots, snapshot slot role context, Snapshot Compare focus commands, direct comparison metric commands, and Snapshot Compare Focus Result feedback from the command map.

## Non-Goals

- Do not change Project Snapshot save, rename, restore, delete, capacity, nested snapshot stripping, snapshot payloads, or saved project schema beyond existing snapshot data.
- Do not change Snapshot Compare derivation, focus routing, focus result labels, Project Safety Readout, Project File Result, Local Draft Recovery Result, save/open/import/download behavior, file dialogs, or `.grooveforge.json` serialization.
- Do not change undo/redo history payloads, realtime playback, render/export, MIDI export, Handoff Pack, Handoff Sheet, arrangement, musical events, mixer/master state, or current project data outside explicit snapshot actions.
- Do not add autosave, file versioning, destructive filesystem actions, cloud sync, accounts, analytics, remote AI, sampling, imported audio, sample-pack workflows, macros, command chains, autoplay, auto-restore, or auto-export.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows plus Project Snapshots and Snapshot Compare UI.
- `src/ui/App.tsx` owns snapshot save, rename, restore, delete, Snapshot Compare focus, and Quick Actions routing behavior.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-698-project-snapshot-command-reference-readouts` and `.worktree/plan-698-project-snapshot-command-reference-readouts` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add a Project Snapshots Project Command Reference row as `Quick Actions / Readout`.
- [x] Add a Snapshot Compare Project Command Reference row as `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe snapshot command-map coverage without expanding project-file or restore scope.
- [x] Add harness expectations that pin both rows and local-only snapshot boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Project Snapshot save/rename/restore/delete, Snapshot Compare, project file behavior, undo/redo, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Project Snapshots and Snapshot Compare as readout-backed Project Command Reference rows. | Local idea slots and saved-take comparison are critical safety loops for both first-time writers and working producers, and the command map should surface them without changing snapshot behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Project Snapshot and Snapshot Compare Command Reference readout coverage. |
| 2026-06-25 | harness_builder | Added Project Snapshots and Snapshot Compare as `Quick Actions / Readout` Project Command Reference rows and pinned README/product/quality/harness coverage without changing snapshot behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Command Reference/docs/harness coverage and preserved snapshot, project file, undo/redo, playback/export, remote, and sampling boundaries. |

## Completion Notes

- Project Snapshots and Snapshot Compare now appear in the Project Command Reference as `Quick Actions / Readout` rows.
- README, product, quality, and harness coverage document that this exposes existing local project-file idea slots, Snapshot slot role context, Snapshot Compare focus commands, direct comparison metric commands, and Focus Result feedback.
- No Project Snapshot save, rename, restore, delete, capacity, nested snapshot stripping, snapshot payload, Snapshot Compare derivation, focus routing, project file, undo/redo, playback, render/export, remote, or sampling behavior changed.
