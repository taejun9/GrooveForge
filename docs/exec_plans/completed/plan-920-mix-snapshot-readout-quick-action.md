# plan-920-mix-snapshot-readout-quick-action

## Goal

Expose Mix Snapshot A/B as a dedicated read-only Quick Action so beginners and working producers can search for current A/B slot state, mix/export posture, and next comparison guidance before capturing, recalling, or clearing snapshots.

## Scope

- Add a UI-local Mix Snapshot A/B Readout Quick Action that focuses the Mix panel without changing A/B slots or mixer/master state.
- Add result metrics/follow-up copy for A/B slot state, current mix/export posture, headroom, master posture, stem readiness, audition cue, and next capture/recall check.
- Update product docs, quality rules, and harness checks so Command Reference `Mix Snapshot A/B` readout coverage matches the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-capture, auto-recall, auto-clear, or auto-compare rendered audio from the readout action; existing decision and direct snapshot commands remain the explicit state-changing paths.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a dedicated Quick Actions Mix Snapshot A/B Readout command that focuses the Mix panel without capturing, recalling, clearing, or changing mixer/master state.
- Reused the existing Mix Snapshot comparison summary so command search shows current A/B slot state, decision target, and next comparison guidance.
- Added UI-local result metrics and follow-up cues for current mix/export posture, master posture, stem readiness, selected Pattern, event counts, arrangement length, and next capture/recall check.
- Updated README, product docs, quality rules, and harness checks so Command Reference `Mix Snapshot A/B` readout coverage now matches the actual Quick Actions list.

## Decision Log

- 2026-06-27: Selected Mix Snapshot A/B Readout because Command Reference exposes `Mix Snapshot A/B` as `Quick Actions / Readout`, but command search still emphasizes decision and slot-changing capture/recall/clear commands instead of a neutral A/B review command.
