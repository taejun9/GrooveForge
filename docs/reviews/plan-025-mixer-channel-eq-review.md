# plan-025-mixer-channel-eq review

## Summary

Non-master mixer channels now have beginner-safe `Low cut` and `Air` EQ controls. The values live in mixer state, migrate safely for older project files, appear in the mixer UI with slider and numeric percent inputs, and affect realtime playback plus offline full-mix/stem rendering.

## QA

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `git diff --check`
- Domain compile/import validation for EQ round-trip, legacy migration, malformed input rejection, and helper clamping.
- Browser validation at `http://127.0.0.1:5173/`.

All validation passed.

## Domain Evidence

Domain validation returned:

```json
{"roundTripSynthLowCut":0.48,"roundTripSynthAir":0.72,"legacySynthLowCut":0,"legacySynthAir":0,"malformedRejected":true,"clampHigh":1,"clampLow":0,"clampBad":0,"masterAir":0}
```

## Browser Evidence

- Synth EQ numeric inputs changed Low cut to `48` and Air to `72`.
- The paired range values updated to `0.48` and `0.72`.
- Synth mixer readout changed to `Cut 48%` and `Air 72%`.
- Undo changed Air back to `36`; redo restored Air to `72`.
- Playback advanced to `Bar 1.3 / Step 11`, then Stop returned the transport to `Ready / 2 bar loop`.
- Export meter stayed non-silent: Hot, peak `-3.2 dB`, RMS `-20.9 dB`, headroom `0.2 dB`, limiter `0.00%`.
- Mixer layout screenshot showed all strips with EQ controls and readouts visible without text overlap.
- Console error log count was 0.

## Findings

No blocking findings.

## Notes

- This is a simplified track-tone control, not a standards-complete EQ implementation.
- Master remains separate from channel EQ; master processing still owns ceiling/output behavior.
- Stem rendering keeps isolated target tracks while applying that track's mixer EQ.

## Residual Risk

The offline renderer approximates EQ through deterministic tonal factors rather than a full filter model. A later audio-engine plan should replace the approximation with shared DSP/filter code when the app adds deeper EQ, compressor, saturation, and send effects.
