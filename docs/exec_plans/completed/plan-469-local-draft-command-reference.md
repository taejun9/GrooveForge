# plan-469-local-draft-command-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add local draft recovery commands to the read-only Command Reference so users can learn that Restore Draft and Clear Draft are available from Quick Actions without opening or running the command palette first.

## Non-Goals

- Do not change local draft storage, Restore Draft/Clear Draft behavior, Quick Actions command routing, project file serialization, project schema, undo/redo history, snapshots, playback, render/export, MIDI export, Handoff, shortcuts, Native Command Menu behavior, or Local Draft Recovery Result behavior.
- Do not add autosave, cloud sync, accounts, analytics, destructive filesystem actions, remote AI, sampling, imported audio, or sample-pack workflows.
- Do not make Command Reference execute commands; it remains static/read-only guidance.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Command Reference static sections and rendered command map.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect Command Reference sections and existing command-map wording.
- [x] Add read-only Restore Draft and Clear Draft entries that point to Quick Actions/local recovery.
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

QA completes before review starts. Review should confirm Command Reference remains read-only, documents only existing local draft recovery commands, and preserves local draft storage, command routing, project files, playback/export, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add local draft recovery to Command Reference instead of adding another project safety panel. | The recovery commands already exist; this slice improves learnability without changing behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created to make local draft recovery discoverable from the read-only command map. |
| 2026-06-19 | harness_builder | Added Restore Draft and Clear Draft entries to the Project section of the read-only Command Reference with Quick Actions/local recovery routing labels only. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and QA harness checks so the command map covers local draft recovery commands while preserving local-first and sampling boundaries. |
| 2026-06-19 | quality_runner | Passed `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`; dev server start was blocked by sandbox `listen EPERM` and escalated retry was rejected by policy. |
| 2026-06-19 | review_judge | Reviewed the completed diff after QA; no blocking findings. |

## Completion Notes

Added read-only Restore Draft and Clear Draft rows to the Command Reference Project section so users can see that the existing local draft recovery commands are available through Quick Actions. The change updates product documentation, quality rules, and executable harness expectations while preserving local draft storage, Restore Draft/Clear Draft behavior, Quick Actions routing, project files, undo/redo history, playback/export, MIDI export, Handoff, shortcuts, Native Command Menu behavior, Local Draft Recovery Result behavior, and sampling boundaries.

QA passed. Local dev-server browser verification could not run because sandboxed localhost listening failed with `listen EPERM: operation not permitted 127.0.0.1:5173`, and the required escalation was rejected by policy. `npm run build` still reports the existing non-blocking Vite chunk-size warning.
