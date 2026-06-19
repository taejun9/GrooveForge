# plan-471-mix-audition-command-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add the existing Stem Audition Readout, Stem Audition commands, and Mix Balance commands to the read-only Command Reference so users can discover mix listening and rough-balance tools before changing mixer state.

## Non-Goals

- Do not change Stem Audition pad behavior, Mix Balance pad behavior, Quick Actions routing, mixer solo/mute/volume/pan/EQ/send/drive/glue state semantics, playback, export, stem render analysis, project file serialization, project schema, undo/redo history, Handoff, or Command Reference open/close behavior.
- Do not add auto-mixing, automatic mastering, autoplay, command chains, modal confirmations, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not make Command Reference execute commands; it remains static/read-only guidance.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Command Reference static sections and rendered command map.
- `src/ui/App.tsx` and `src/ui/workstationMixPanels.tsx`: existing Stem Audition Readout, Stem Audition Pads, Mix Balance Pads, and Quick Actions.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect Command Reference sections and existing mix audition command wording.
- [x] Add read-only mix audition rows for Stem Audition Readout, Stem Audition, and Mix Balance.
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

QA completes before review starts. Review should confirm the Command Reference remains read-only, documents only existing mix audition and balance surfaces, and preserves mixer state, playback, export, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add mix audition tools to Command Reference instead of adding new mix UI. | Stem Audition and Mix Balance already exist; this slice improves beginner discoverability and producer speed without changing mixer behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make existing mix listening and balance tools discoverable from the read-only command map. |
| 2026-06-20 | harness_builder | Added a read-only Mix section to Command Reference with Stem Audition Readout, Stem Audition, Mix Balance, and Mix Coach rows. |
| 2026-06-20 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations so mix audition discovery stays aligned with existing local mixer behavior. |
| 2026-06-20 | quality_runner | Passed `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`; dev server start was blocked by sandbox `listen EPERM` and escalated retry was rejected by policy. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA; no blocking findings. |

## Completion Notes

Added a read-only Mix section to Command Reference with existing Stem Audition Readout, Stem Audition, Mix Balance, and Mix Coach rows. The change also updates the Command Reference Quick Action result label, product documentation, quality rules, and executable harness expectations while preserving Stem Audition pad behavior, Mix Balance pad behavior, Quick Actions routing, mixer solo/mute/volume/pan/EQ/send/drive/glue semantics, playback, export, stem render analysis, project files, undo/redo history, Handoff, Command Reference open/close behavior, and sampling boundaries.

QA passed. Local dev-server browser verification could not run because sandboxed localhost listening failed with `listen EPERM: operation not permitted 127.0.0.1:5173`, and the required escalation was rejected by policy. `npm run build` still reports the existing non-blocking Vite chunk-size warning.
