# plan-925-sound-preset-readout-quick-action

## Goal

Expose Sound Preset as a dedicated read-only Quick Action so beginners and working producers can search for the current full-tone preset preview, editable sound posture, and next audition check before applying a preset.

## Scope

- Add a UI-local Sound Preset Readout Quick Action that focuses the Sound panel without applying a Sound Preset.
- Add result metrics/follow-up copy for suggested/current preset target, current and target sound posture, selected Pattern, event counts, arrangement length, export readiness, audition cue, and next manual sound-design check.
- Update product docs, quality rules, and harness checks so Command Reference `Sound Preset` readout coverage matches the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-apply Sound Preset pads, change sound-design parameters, or change direct Sound Preset pad behavior from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a dedicated `sound-preset-readout-action` Quick Action that focuses the existing Sound panel, reports the current full-tone preset preview target, and returns UI-local result metrics without applying sound-design changes.
- Added Command Reference coverage for Sound Preset Readout so the read-only command is discoverable separately from Sound Preset Decision/current/direct apply commands.
- Updated product docs, quality rules, and QA harness expectations to preserve direct beat composition, local-first behavior, and sampler-secondary scope.

## Decision Log

- 2026-06-27: Selected Sound Preset Readout because Command Reference exposes `Sound Preset` as `Quick Actions / Readout`, but the existing `sound-preset` Quick Action applies the current preview instead of offering a neutral pre-apply full-tone posture review.
