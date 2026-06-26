# plan-929-pattern-chain-readout-quick-action

## Goal

Expose Pattern Chain as a dedicated read-only Quick Action so beginners and working producers can inspect the current 8-bar Pattern A/B/C sequence recommendation, chain posture, selected arrangement context, and next audition check before applying a chain or expanding the song form.

## Scope

- Add a UI-local Pattern Chain Readout Quick Action that focuses the existing Arrange panel without applying Pattern Chain or Chain Expand handlers.
- Add result metrics/follow-up copy for the current Pattern Chain recommendation, Pattern A/B/C sequence, block count, hook count, bar count, selected Pattern, editable event counts, audition cue, and next manual chain check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Pattern Chain readout coverage is distinct from mutating Pattern Chain Decision, direct chain, and Chain Expand commands.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-apply Pattern Chain, Chain Expand, arrangement templates, arrangement moves, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `Pattern Chain Readout` Quick Action that focuses the existing Arrange panel and reports the current Pattern Chain preview posture without applying Pattern Chain or Chain Expand.
- Split Pattern Chain Command Reference/docs coverage so `Pattern Chain Readout` is the read-only status path and `Pattern Chain` remains the explicit decision/apply path.
- Updated the QA harness to cover the new readout command, result metric, follow-up copy, Command Reference row, and non-mutating quality rules.

## Decision Log

- 2026-06-27: Selected Pattern Chain Readout because Command Reference presents Pattern Chain as `Quick Actions / Readout`, while the existing Pattern Chain Quick Actions run Pattern Chain apply or Chain Expand handlers. A separate readout keeps the first product target focused on composing and arranging a sample-free 8-bar beat before mutating arrangement structure.
