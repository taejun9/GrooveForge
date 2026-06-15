# plan-036-event-chance Review

## Summary

GrooveForge now supports editable chance on 808, melody, and chord events. Older project files migrate missing event probabilities to 100%, and realtime playback, full-mix WAV export, and stem export share deterministic gates so saved project output stays reproducible.

## QA

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser validation on `http://127.0.0.1:5174/`
- Domain compile/import check for migration and deterministic probability boundaries

All validation passed.

## Browser Validation

- Selected an 808 note and edited Note Chance to 80%.
- Edited Chord 1 Chance to 70%.
- Earlier pass confirmed Synth note Chance edits to 55%.
- Numeric chance inputs display normalized values without leading zero padding.
- Playback remained stable after chance edits.
- Browser console error count was 0.

## Domain Validation

- Old project JSON without bass, melody, or chord `probability` fields migrates those events to 100% chance.
- A 0% 808, melody, or chord event always skips.
- A 100% 808, melody, or chord event always plays.
- The same track/event/absolute-step seed produces stable decisions.

## Findings

- No blocking findings.
- Chance remains event-local and pattern-scoped; it does not add sampling or remote generation dependencies.
- Deterministic gates mean export is reproducible, but realtime looping can still create variation across repeated passes because the absolute step seed advances.

## Residual Risk

Users still do not get a visual pass-by-pass preview of which chance events will fire next. That should wait for a richer event inspection or playhead overlay rather than crowding the current grid.

## Follow-Ups

- Add subtle grid badges for chance-enabled 808, melody, and chord events.
- Consider phrase-level variation controls once event chance settles.
