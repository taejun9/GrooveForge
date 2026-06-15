# plan-035-drum-probability Review

## Summary

GrooveForge now supports editable per-step drum probability. Each drum lane step stores a 0-100% chance value in Pattern A/B/C data, defaults older projects to 100%, and uses deterministic gates shared by realtime playback, full-mix WAV export, and stem export.

## QA

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser validation on `http://127.0.0.1:5173/`
- Domain compile/import check for migration and deterministic probability boundaries

All validation passed.

## Browser Validation

- Selected `Kick step 1`; Chance controls became enabled.
- Edited Chance to 50%; readout changed to `50% chance`.
- Playback remained stable with the edited probability value.
- Browser console error count was 0.

## Domain Validation

- Old project JSON without `drumProbabilities` migrates to 100% chance.
- Saved edited projects serialize `drumProbabilities`.
- A 0% drum step always skips and a 100% drum step always plays.
- The same lane/step/absolute-step seed produces stable decisions.

## Findings

- No blocking findings.
- Probability is intentionally drum-only in this slice. 808, melody, and chord probability remain future work.
- Probability gates are deterministic so export remains reproducible from saved project data.

## Residual Risk

Realtime playback and offline render share the same helper, but users do not yet see a visual preview of which probabilistic hits will fire on a future pass. That should wait until the app has a richer playhead or event-inspection surface.

## Follow-Ups

- Add probability to note/chord events after drum probability settles.
- Add visual indicators for chance-based hits in the sequencer grid.
