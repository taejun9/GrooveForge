# plan-928-sound-snapshot-readout-quick-action

## Goal

Expose Sound Snapshot A/B as a dedicated read-only Quick Action so beginners and working producers can inspect the current capture/recall recommendation, A/B slot state, tone-pass comparison, and next listening check without capturing, recalling, clearing, or changing sound settings.

## Scope

- Add a UI-local Sound Snapshot A/B Readout Quick Action that focuses the existing Sound panel without running Sound Snapshot capture, recall, or clear handlers.
- Add result metrics/follow-up copy for the current recommendation, A/B slot state, tone comparison, selected Pattern, event counts, arrangement length, export readiness, audition cue, and next manual snapshot check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Sound Snapshot A/B readout coverage is distinct from the mutating Sound Snapshot Decision and capture/recall/clear commands.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-capture, auto-recall, auto-clear, or change SoundDesign from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added `sound-snapshot-readout-action` as a UI-local Quick Action that focuses the existing Sound panel, reports the current Sound Snapshot A/B recommendation and tone-pass posture, and leaves Sound Snapshot slots plus project data unchanged.
- Added Command Reference coverage for Sound Snapshot A/B Readout separately from the explicit Sound Snapshot A/B Decision capture/recall route.
- Updated product docs, quality rules, and QA harness expectations so the readout path preserves direct beat composition, local-first behavior, and sampler-secondary scope.

## Decision Log

- 2026-06-27: Selected Sound Snapshot A/B Readout after Sound Focus Readout because Command Reference already presents Sound Snapshot A/B as `Quick Actions / Readout`, while the existing Quick Actions entry named Sound Snapshot Decision runs capture or recall handlers.
