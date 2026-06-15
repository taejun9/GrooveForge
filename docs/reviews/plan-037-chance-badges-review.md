# plan-037-chance-badges Review

## Summary

GrooveForge now shows compact chance badges directly on below-100% drum steps, 808/melody note cells, and chord slots. The badges are read-only visual indicators; they make conditional events easier to scan without changing playback, export, save/load, or probability behavior.

## QA

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser validation on `http://127.0.0.1:5174/`

All validation passed.

## Browser Validation

- Default 100% project state showed 0 drum, note, chord, and `.chance-badge` indicators.
- Edited Kick step 1 Chance to 60%; drum grid badge rendered as `60`.
- Edited 808 F1 step 1 Chance to 80%; note grid badge rendered as `80`.
- Edited Chord 1 Chance to 70%; chord slot badge rendered as `70%`.
- Badges stayed compact in the drum and note grids without truncation after using compact numeric labels.
- Playback remained stable after badge-triggering chance edits.
- Browser console error count was 0.

## Findings

- No blocking findings.
- The first pass incorrectly put the `chance-badge` class/test id on all drum step metadata badges; this was corrected so only below-100% drum chance receives chance-specific hooks.
- Badge work is visual-only and does not change deterministic probability gates, saved project data, realtime playback, WAV export, or stem export.

## Residual Risk

The drum badge shares the same small step metadata area as hat repeat and microtiming badges. It stays readable for the current compact numeric label, but a future denser drum editor may need a more structured multi-indicator cell layout.

## Follow-Ups

- Add a richer event-inspection overlay later if probability, repeat, microtiming, and velocity all need simultaneous at-a-glance display.
