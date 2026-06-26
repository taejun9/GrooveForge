# plan-936-song-form-overview-readout-quick-action

## Goal

Expose Song Form Overview as a dedicated read-only Quick Action so beginners and working producers can inspect the current full-song structure priority, target block, Pattern A/B/C usage, bar range, energy, mute posture, transition posture, audition cue, and next song-form check before explicitly moving to the priority block.

## Scope

- Add a UI-local Song Form Overview Readout Quick Action that focuses the existing Arrange panel without selecting a block or changing arrangement state.
- Add result metrics/follow-up copy for the current song-form priority metric, target block, section, Pattern A/B/C assignment, bar range, bar length, energy, mute posture, selected Pattern, editable event count, Pattern A/B/C usage, song block count, song length, transition posture, audition cue, and next song-form check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Song Form Overview readout coverage is distinct from the existing Song Form Priority navigation command.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Song Form Priority navigation, Arrangement Block Jump/Cue, Section Locator, Arrangement Focus, Arrangement Move, Arrangement Arc, Arrangement Template, Chain Expand, Pattern Chain, selected-block edits, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `song-form-overview-readout-action` Quick Action that focuses the existing Arrange panel and reports the current song-form priority without changing selected block or arrangement data.
- Kept `song-form-priority` as the explicit selected-block focus route and added distinct local result metrics/follow-up copy for the readout path before selected-block navigation runs.
- Split Command Reference, product, quality, and harness coverage so Song Form Overview Readout is the read-only route while Song Form Priority remains the explicit priority-block focus command.

## Decision Log

- 2026-06-27: Selected Song Form Overview Readout because the Arrange command map already describes Song Form Overview as readout while the only Quick Action route moves selected-block focus; separating readout and priority navigation keeps full-song inspection non-mutating.
- 2026-06-27: Kept the readout command on the existing Arrange panel focus/readout path so direct beat composition remains the primary workflow and sampling stays optional extension scope.
