# plan-044-chord-inversions Review

## Summary

Chord events now support per-chord Root, 1st, and 2nd inversion controls. The data is stored on editable chord events, migrated for older project files, and rendered through the shared `chordPitches` helper used by realtime playback and offline WAV/stem export.

## QA

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke: changed first chord from Root to 1st inversion, confirmed badge/control state changed, undo restored Root, playback started/stopped, export meter stayed non-silent, and console errors were empty.

## Findings

- No blocking issues found.
- Inversion is local musical event data and does not add sampling, imported audio, remote AI, or hidden audio assets.
- Realtime playback and offline export paths share the same chord pitch helper, so voicing behavior stays aligned.

## Residual Risk

The feature is a manual voicing control, not automatic voice leading. Smooth progression-wide voice leading remains a later composition-engine task.

## Follow-Ups

- Add automatic smooth-voicing suggestions after chord editing and scale/key behavior remain stable.
- Consider richer chord extensions once the current inversion controls are validated in real beat-making sessions.
