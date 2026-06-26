# plan-919-stem-audition-readout-quick-action

## Goal

Expose the existing Stem Audition Readout as a dedicated Quick Action so beginners and working producers can search for the current full-mix/stem audition posture and jump to the Mix panel before changing mixer solo/mute state.

## Scope

- Add a read-only Stem Audition Readout Quick Action that reuses the existing mixer-derived readout and focuses the Mix panel.
- Add result metrics/follow-up copy so Quick Actions can report full mix, soloed stem, manual audition state, mixer solo/mute posture, decision target, audition cue, and next check context.
- Update Command Reference/product docs, quality rules, and harness coverage to keep the documented readout path aligned with the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-change mixer solo/mute state from the readout action; direct Stem Audition and Stem Audition Decision commands remain the explicit state-changing paths.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a dedicated Quick Actions Stem Audition Readout command that focuses the Mix panel without mutating mixer state.
- Passed the existing mixer-derived readout into Quick Actions so the command list can show current Full Mix, soloed stem, or manual audition posture before Stem Audition Decision/direct pad commands.
- Added UI-local result metrics and follow-up cues for current audition, decision target, mixer solo/mute posture, event/export/stem readiness, and next listening check.
- Updated README, product docs, quality rules, and harness checks so documented Stem Audition Readout coverage now matches the actual Quick Actions list.

## Decision Log

- 2026-06-27: Selected Stem Audition Readout Quick Action because Command Reference already exposes the readout as `Quick Actions / Readout`, but the actual command list still jumps from Mix Coach into Stem Audition Decision and direct stem pads.
