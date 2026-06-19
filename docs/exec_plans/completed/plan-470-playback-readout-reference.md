# plan-470-playback-readout-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add Pattern Playback Readout and Arrangement Playback Readout to the read-only Command Reference so users can discover the existing edit-versus-audible status lines before using Audible Pattern Follow or Audible Arrangement Follow.

## Non-Goals

- Do not change playback scheduling, playback snapshots, selected Pattern behavior, selected arrangement block behavior, follow command routing, loop scope, Pattern A/B/C event data, arrangement data, undo/redo history, project file serialization, project schema, save/load, render/export, MIDI export, Handoff, or Command Reference open/close behavior.
- Do not add automatic follow mode, autoplay, command chains, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not make Command Reference execute commands; it remains static/read-only guidance.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Command Reference static sections and rendered command map.
- `src/ui/App.tsx`: existing Pattern Playback Readout, Arrangement Playback Readout, and Audible Follow handlers.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect Command Reference sections and existing playback readout wording.
- [x] Add read-only Pattern Playback Readout and Arrangement Playback Readout entries beside their Audible Follow commands.
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

QA completes before review starts. Review should confirm the Command Reference remains read-only, documents only existing playback readouts, and preserves playback, selection, Pattern/arrangement data, export, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add playback readouts to Command Reference instead of adding a new overlay or tutorial. | The readouts already exist in the workstation; this slice improves discoverability without changing playback or selection behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created to make existing edit-versus-audible playback context discoverable from the read-only command map. |
| 2026-06-19 | harness_builder | Added read-only Pattern Playback Readout and Arrangement Playback Readout rows to Command Reference beside their Audible Follow commands. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations so playback readouts are documented without changing playback or selection behavior. |
| 2026-06-19 | quality_runner | Passed `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`; dev server start was blocked by sandbox `listen EPERM` and escalated retry was rejected by policy. |
| 2026-06-19 | review_judge | Reviewed the completed diff after QA; no blocking findings. |

## Completion Notes

Added read-only Pattern Playback Readout and Arrangement Playback Readout rows to the Command Reference so users can discover existing edit-versus-audible Pattern and block status before using Audible Pattern Follow or Audible Arrangement Follow. The change updates product documentation, quality rules, and executable harness expectations while preserving playback scheduling, playback snapshots, selected Pattern behavior, selected arrangement block behavior, follow command routing, loop scope, Pattern A/B/C event data, arrangement data, undo/redo history, project files, save/load, render/export, MIDI export, Handoff, Command Reference open/close behavior, and sampling boundaries.

QA passed. Local dev-server browser verification could not run because sandboxed localhost listening failed with `listen EPERM: operation not permitted 127.0.0.1:5173`, and the required escalation was rejected by policy. `npm run build` still reports the existing non-blocking Vite chunk-size warning.
