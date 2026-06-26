# plan-926-drum-kit-readout-quick-action

## Goal

Expose Drum Kit as a dedicated read-only Quick Action so beginners and working producers can search for the current built-in kick/clap/hat kit preview, drum rack posture, and next audition check before applying a kit.

## Scope

- Add a UI-local Drum Kit Readout Quick Action that focuses the Sound panel without applying a Drum Kit.
- Add result metrics/follow-up copy for suggested/current kit target, current drum tone and rack posture, selected Pattern, event counts, arrangement length, export readiness, audition cue, and next manual drum-kit check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Drum Kit readout coverage matches the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-apply Drum Kit pads, change sound-design or mixer parameters, or change direct Drum Kit pad behavior from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a dedicated `drum-kit-readout-action` Quick Action that focuses the existing Sound panel, reports the current built-in kick/clap/hat kit preview target, and returns UI-local result metrics without applying kit changes.
- Added Command Reference coverage for Drum Kit Readout so the read-only command is discoverable separately from Drum Kit Decision/current/direct apply commands.
- Updated product docs, quality rules, and QA harness expectations to preserve direct beat composition, local-first behavior, and sampler-secondary scope.

## Decision Log

- 2026-06-27: Selected Drum Kit Readout after Sound Preset Readout because Command Reference exposes `Drum Kit` as `Quick Actions / Readout`, but the existing `drum-kit` Quick Action applies the current suggested kit instead of offering a neutral pre-apply built-in drum posture review.
