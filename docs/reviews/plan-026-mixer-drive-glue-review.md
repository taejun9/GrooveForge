# plan-026-mixer-drive-glue review

## Summary

Non-master mixer channels now have beginner-safe `Drive` and `Glue` controls. The values live in mixer state, migrate safely for older project files, appear in the mixer UI with slider and numeric percent inputs, and affect realtime playback plus offline full-mix/stem rendering.

## QA

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `git diff --check`
- Domain compile/import validation for Drive/Glue round-trip, legacy migration, malformed input rejection, and helper clamping.
- Browser validation at `http://127.0.0.1:5173/`.

All validation passed.

## Domain Evidence

Domain validation returned:

```json
{"roundTripSynthDrive":0.44,"roundTripSynthGlue":0.66,"legacySynthDrive":0,"legacySynthGlue":0,"malformedRejected":true,"clampHigh":1,"clampLow":0,"clampBad":0,"masterDrive":0}
```

## Browser Evidence

- Initial Synth Drive/Glue controls existed with starter values `8` and `12`.
- Synth Drive/Glue numeric inputs changed to `44` and `66`.
- The paired range values updated to `0.44` and `0.66`.
- Synth mixer readout changed to `Drive 44%` and `Glue 66%`.
- Undo changed Glue back to `12`; redo restored Glue to `66`.
- Playback advanced to `Bar 1.3 / Step 11`, then Stop returned the transport to `Ready / 2 bar loop`.
- Export meter stayed non-silent: Limiter active, peak `-3.0 dB`, RMS `-20.7 dB`, headroom `0.0 dB`, limiter `0.00%`.
- Stem export reported `Exported 4 stems`.
- Mixer layout screenshot showed all non-master strips with Low cut, Air, Drive, Glue, numeric inputs, and readouts visible without text overlap.
- Console error log count was 0.

## Findings

No blocking findings.

## Notes

- `Drive` is a simple track-level saturation control.
- `Glue` is simplified compression for this MVP, not a full compressor device with threshold, ratio, attack, release, and makeup controls.
- Master remains separate from channel Drive/Glue; master processing still owns ceiling/output behavior.

## Residual Risk

The offline renderer approximates saturation and compression with deterministic sample shaping rather than sharing a full DSP graph with realtime Web Audio. A later audio-engine plan should consolidate shared mixer-device DSP when the app adds deeper compressor UI, send effects, and mastering-device chains.
