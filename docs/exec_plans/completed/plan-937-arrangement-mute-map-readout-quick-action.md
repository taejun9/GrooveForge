# plan-937-arrangement-mute-map-readout-quick-action

## Goal

Expose Arrangement Mute Map as a dedicated read-only Quick Action so beginners and working producers can inspect the current layer-dropout priority lane, section mute/live posture, selected block, Pattern A/B/C usage, arrangement length, audition cue, and next mute-map check before explicitly focusing a mute-map lane.

## Scope

- Add a UI-local Arrangement Mute Map Readout Quick Action that focuses the existing Arrange panel without changing focused mute-map lane or arrangement state.
- Add result metrics/follow-up copy for the current priority lane, mute/live posture, selected block, selected Pattern, editable event count, Pattern A/B/C usage, arrangement block count, song length, transition-map posture, audition cue, and next mute-map check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Arrangement Mute Map Readout is distinct from the existing Arrangement Mute Map focus/current/direct lane commands.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Arrangement Mute Map focus, selected-block edits, mute edits, Arrangement Transition Map, Arrangement Focus, Arrangement Move, Arrangement Arc, Arrangement Template, Chain Expand, Pattern Chain, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added `arrangement-mute-map-readout-action` as a read-only Quick Action that scrolls to Arrange and reports the current Arrangement Mute Map priority lane without changing the focused mute-map lane, arrangement state, playback, exports, or project data.
- Added distinct readout result metrics/follow-up copy for Arrangement Mute Map Readout while preserving existing Arrangement Mute Map focus/current/direct lane result handling.
- Updated Command Reference, README, product rules, quality rules, and QA expectations so the readout command is separate from mute-map focus commands.

## Decision Log

- 2026-06-27: Selected Arrangement Mute Map Readout because the Arrange command map treats Arrangement Mute Map as readout while the existing Quick Action changes the focused lane; separating readout and focus keeps layer-dropout inspection non-mutating.
