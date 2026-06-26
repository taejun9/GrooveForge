# plan-938-arrangement-transition-map-readout-quick-action

## Goal

Expose Arrangement Transition Map as a dedicated read-only Quick Action so beginners and working producers can inspect the current section-handoff priority, Pattern A/B/C transition, energy change, muted-layer change, event-density change, selected block, arrangement length, audition cue, and next transition-map check before explicitly focusing or cueing a transition.

## Scope

- Add a UI-local Arrangement Transition Map Readout Quick Action that focuses the existing Arrange panel without changing focused transition, cue state, loop scope, playback, or arrangement state.
- Add result metrics/follow-up copy for the current priority transition, handoff posture, Pattern A/B/C from/to labels, bar range, energy change, muted-layer change, event-density change, selected Pattern, selected block, arrangement block count, song length, current loop scope, audition cue, and next transition-map check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Arrangement Transition Map Readout is distinct from existing Arrangement Transition Map focus/current/direct transition commands and Transition Loop cue commands.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run transition focus, Transition Loop cueing, selected-block navigation, Arrangement Mute Map, Arrangement Focus, Arrangement Move, Arrangement Arc, Arrangement Template, Chain Expand, Pattern Chain, Pattern A/B/C edits, or arrangement mutations from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added `arrangement-transition-map-readout-action` as a read-only Quick Action that scrolls to Arrange and reports the current Arrangement Transition Map priority handoff without changing focused transition, cue state, loop scope, playback, exports, or project data.
- Added distinct readout result metrics/follow-up copy for Arrangement Transition Map Readout while preserving existing Arrangement Transition Map focus/current/direct transition and Transition Loop cue result handling.
- Updated Command Reference, README, product rules, quality rules, and QA expectations so the readout command is separate from transition focus/cue commands.

## Decision Log

- 2026-06-27: Selected Arrangement Transition Map Readout because the Arrange command map treats transition diagnostics as readout while the existing Quick Action changes focused transition or cue state; separating readout and focus/cue keeps section-handoff inspection non-mutating.
