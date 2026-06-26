# plan-927-sound-focus-readout-quick-action

## Goal

Expose Sound Focus as a dedicated read-only Quick Action so beginners and working producers can search for the current 808/Synth/Chords tone-focus preview, editable sound posture, and next audition check before applying a focus pad.

## Scope

- Add a UI-local Sound Focus Readout Quick Action that focuses the Sound panel without applying a Sound Focus pad.
- Add result metrics/follow-up copy for suggested/current focus target, current and target sound posture, selected Pattern, event counts, arrangement length, export readiness, audition cue, and next manual tone-focus check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Sound Focus readout coverage matches the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-apply Sound Focus pads, change sound-design parameters, or change direct Sound Focus pad behavior from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added `sound-focus-readout-action` as a UI-local Quick Action that focuses the existing Sound panel, reports the current 808/Synth/Chords tone-focus preview and editable sound posture, and leaves project data unchanged.
- Added Command Reference coverage for Sound Focus Readout separately from Sound Focus Decision, current apply, and direct focus pad commands.
- Updated product docs, quality rules, and QA harness expectations so the readout path preserves direct beat composition, local-first behavior, and sampler-secondary scope.

## Decision Log

- 2026-06-27: Selected Sound Focus Readout after Sound Preset and Drum Kit Readouts because Command Reference exposes `Sound Focus` as `Quick Actions / Readout`, but the existing `sound-focus` Quick Action applies the current suggested focus instead of offering a neutral pre-apply tone-focus posture review.
