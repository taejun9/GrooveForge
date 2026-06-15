# plan-019-drum-dynamics review

## Summary

Drum programming now supports per-step velocity and hat repeat dynamics. This moves GrooveForge closer to a practical beat workstation: beginners can keep using the simple step grid, while working producers can shape groove energy without importing samples.

## QA Evidence

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser validation at `http://127.0.0.1:5173/`
- Domain function validation for project save/load migration

Browser results:

- Initial Pattern A/B/C event counts included repeat-aware hats: 34/41/26.
- Active Hat 3 first click selected the step without turning it off.
- Hat 3 velocity changed to 42%.
- Hat 3 repeat changed to 4x.
- Pattern A rose from 34 to 37 events.
- Undo returned Pattern A to 34 events.
- Redo restored Pattern A to 37 events.
- Reselecting Hat 3 after redo showed 42% velocity and 4x repeat.
- Playback start/stop worked.
- Export meter remained non-silent.
- Console error logs were empty.

Domain results:

- `serializeProjectFile` and `parseProjectFile` round-tripped Hat 3 velocity 0.42 and repeat 4.
- Legacy pattern data without `drumVelocities` or `hatRepeats` migrated to valid 16-step dynamics arrays.
- Malformed dynamics data was rejected as an invalid project file.

## Review Findings

No blocking issues found.

## Checks

- Dynamics remain local event data, not imported audio.
- Pattern A/B/C copy and clear paths preserve or reset dynamics with pattern data.
- Realtime playback and offline WAV/stem export use the same velocity and repeat helpers.
- Active step selection no longer destroys a hit before editing.
- Undo/redo records dynamics edits through the existing bounded project history.
- Documentation and static QA now cover drum dynamics.

## Residual Risk

Velocity and hat repeat are the first dynamics slice. Future groove work should add microtiming, probability, flam, lane-specific accents, and better per-style drum articulation after the current event model remains stable.
