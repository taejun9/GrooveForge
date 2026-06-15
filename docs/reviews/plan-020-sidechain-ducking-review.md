# plan-020-sidechain-ducking-review

## Summary

Kick-to-808 sidechain ducking is implemented as local sound-design state. The control is exposed in Studio as `Kick duck`, shown in sound and 808 readouts, saved in project files, migrated for older files, and applied consistently to realtime bass playback plus full-mix and 808 stem export.

## QA

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run verify`
- `git diff --check`
- Domain compile/import validation for save/load, migration, malformed-value rejection, and duck gain.
- Browser validation at `http://127.0.0.1:5173/`.

All validation passed.

## Browser Evidence

- Guided startup showed `Duck 42%`; Studio sidechain input was hidden.
- Studio showed sidechain input `42`, slider `0.42`, and 808 device readout with drive and duck values.
- Editing sidechain to 82 committed `Duck 82%`, input `82`, slider `0.82`, and 808 readout `drive 34% / duck 82%`.
- Undo restored `Duck 42%`; redo restored `Duck 82%`.
- Playback started and advanced to Bar 1.2 / Step 6, then Stop returned the transport to Ready / 2 bar loop.
- Export meter remained non-silent: Hot, peak -3.9 dB, RMS -21.5 dB, headroom 0.9 dB, limiter 0.00%.
- Console error log count was 0.

## Domain Evidence

Domain validation returned:

```json
{"roundTripDuck":0.82,"migratedDuck":0.5,"gainAtKick":0.4214080000000001,"gainAfterRelease":0.70550848,"malformedRejected":true}
```

## Findings

No blocking findings.

## Notes

- The initial browser pass exposed that typed percent values created too many undo steps. `SoundControl` now keeps number input text local and commits once on blur/Enter.
- Device readout preserves both 808 drive and duck amount instead of replacing drive with duck.

## Residual Risk

The sidechain rule is deterministic step-level gain shaping, not a time-varying compressor envelope. It is appropriate for this MVP control, but future pro mixing work should add a real compressor/sidechain device or envelope view once the mixer device model is ready.
