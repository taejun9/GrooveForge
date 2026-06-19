# plan-473-project-file-command-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Make the existing project file safety path easier to discover from the read-only Command Reference by adding Project Safety Readout and Project File Result rows next to Save/Open/Restore Draft, then align the docs and QA harness so save/open feedback remains an explicit local workstation affordance.

## Non-Goals

- Do not change project file serialization, parse/load behavior, Electron file dialogs, browser download/import fallback, local draft storage, save/open handlers, undo/redo history, playback, export, Handoff, or project schema.
- Do not add autosave, cloud sync, accounts, collaboration, analytics, destructive filesystem actions, remote AI, sampling, imported audio, or sample-pack workflows.
- Do not make Command Reference execute commands; it remains static/read-only guidance.

## Context Map

- `src/ui/workstationShellPanels.tsx`: read-only Command Reference sections and project rows.
- `src/ui/App.tsx`: existing Project File Result state, save/open handlers, Project Safety Readout, and Command Reference Quick Action result label.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries for project file safety.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect current Project File Result, Project Safety Readout, and Command Reference wording.
- [x] Add read-only Project rows for Project Safety Readout and Project File Result.
- [x] Update docs and harness expectations.
- [x] Run QA, review, complete plan, and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm the Command Reference remains read-only, documents only existing project-file safety surfaces, and preserves serialization, dialogs, local drafts, undo/redo, playback, export, Handoff, project schema, and sampling boundaries.

## QA Results

- 2026-06-20: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-20: `git diff --check` passed.
- 2026-06-20: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-20: `npm run typecheck` passed.
- 2026-06-20: `npm run build` passed with the existing Vite chunk-size warning.
- 2026-06-20: `npm run qa` passed.
- 2026-06-20: `npm run verify` passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 style profiles.
- 2026-06-20: `npm run dev -- --host 127.0.0.1` could not start in the sandbox because localhost listen failed with `EPERM`; escalated retry was rejected by policy.

## Review

Post-QA review found no blockers. The Command Reference remains read-only and now documents only existing project safety surfaces: Project Safety Readout, Project File Result, Save/Open, Restore Draft, and Clear Draft. The save/open handlers, project file serialization, Electron dialogs, browser fallback, local draft storage, undo/redo history, playback, render/export, Handoff, project schema, and sampling boundaries are unchanged.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Connect existing project-file result feedback to Command Reference instead of changing save/open behavior. | Save/open feedback already exists; discoverability is the safer next product increment for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make local project-file safety feedback visible in the desktop command map. |
| 2026-06-20 | repo_cartographer | Confirmed Project File Result and Project Safety Readout already exist as UI-local save/open safety surfaces before adding Command Reference rows. |
| 2026-06-20 | harness_builder | Added read-only Command Reference rows for Project Safety Readout and Project File Result, updated the Command Reference Quick Action result label, and aligned README/product/quality/harness checks. |
| 2026-06-20 | quality_runner | Full QA passed; localhost dev server verification remains blocked by sandbox `listen EPERM` and escalation rejection. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA; no blocking findings. |

## Completion Notes

Added Project Safety Readout and Project File Result rows to the read-only Project section of Command Reference, and updated the Command Reference Quick Action result label to include Project. Documentation and harness expectations now ensure the save/open safety path stays visible without changing save/open behavior, project serialization, local draft storage, undo/redo, playback, export, Handoff, project schema, or sampling scope.
