# plan-472-deliver-command-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add the existing Export Format Readout, Handoff Package Check, Handoff Next Export, and direct export commands to the read-only Command Reference so users can discover the final delivery path from WAV/stem/MIDI/Handoff Sheet readiness through explicit exports.

## Non-Goals

- Do not change export handlers, render bytes, MIDI bytes, Handoff Sheet content, filenames, download behavior, Handoff Pack scoring, Send Order, Export Receipt behavior, project schema, undo/redo history, playback, save/load, or Command Reference open/close behavior.
- Do not add batch export, ZIP/archive creation, upload, native folder automation, background rendering, auto-export, retries, command chains, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not make Command Reference execute commands; it remains static/read-only guidance.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Command Reference static sections and rendered command map.
- `src/ui/App.tsx`: existing Handoff Pack, Export Format Focus, Handoff Package Check, Handoff Next Export, and direct export Quick Actions.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect Command Reference sections and existing export/handoff command wording.
- [x] Add read-only Deliver rows for Export Format Readout, Handoff Package Check, Handoff Next Export, and direct exports.
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

QA completes before review starts. Review should confirm the Command Reference remains read-only, documents only existing delivery/export surfaces, and preserves file contents, export handlers, playback, project data, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add delivery/export rows to Command Reference instead of changing Handoff Pack UI. | The export surfaces already exist; this slice makes the final beginner/pro delivery path discoverable without changing export behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make the final WAV/stem/MIDI/Handoff Sheet delivery path discoverable from the read-only command map. |
| 2026-06-20 | harness_builder | Added a read-only Deliver section to Command Reference with Export Format Readout, Handoff Package Check, Handoff Next Export, and Direct Exports rows. |
| 2026-06-20 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations so delivery/export discovery stays aligned with existing local Handoff Pack and export behavior. |
| 2026-06-20 | quality_runner | Passed `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`; dev server start was blocked by sandbox `listen EPERM` and escalated retry was rejected by policy. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA; no blocking findings. |

## Completion Notes

Added a read-only Deliver section to Command Reference with existing Export Format Readout, Handoff Package Check, Handoff Next Export, and Direct Exports rows. The change also updates the Command Reference Quick Action result label, product documentation, quality rules, and executable harness expectations while preserving export handlers, render bytes, MIDI bytes, Handoff Sheet content, filenames, download behavior, Handoff Pack scoring, Send Order, Export Receipt behavior, project data, playback, save/load, Command Reference open/close behavior, and sampling boundaries.

QA passed. Local dev-server browser verification could not run because sandboxed localhost listening failed with `listen EPERM: operation not permitted 127.0.0.1:5173`, and the required escalation was rejected by policy. `npm run build` still reports the existing non-blocking Vite chunk-size warning.
