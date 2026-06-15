# plan-023-drum-microtiming-review

## Summary

Drum microtiming is implemented as pattern-level event data. Selected drum hits can be nudged with `Early`, `On`, `Late`, or an exact millisecond input, and the same timing data drives realtime playback, full-mix export, and stem export.

## QA

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `git diff --check`
- Domain compile/import validation for save/load, migration, malformed-value rejection, clamping, and clone independence.
- Browser validation at `http://127.0.0.1:5173/`.

All validation passed.

## Domain Evidence

Domain validation returned:

```json
{"roundTripHat2":15,"roundTripKick0":-12,"migratedHat2":0,"malformedRejected":true,"clampLow":-35,"clampHigh":35,"cloneOriginalHat2":15,"cloneChangedHat2":-9}
```

## Browser Evidence

- Initial inspector showed `Select step`; timing controls existed but were disabled before step selection.
- Selecting active Hat 3 showed `Hat 3 62% / On grid`, input `0`, and `On` selected.
- Clicking `Late` changed the readout to `Hat 3 62% / Late +15 ms`, input `15`, and step badge `3+15`.
- Undo removed the timing badge; redo restored it. Reselecting Hat 3 showed `Late +15 ms`.
- Manual ms input changed the same hit to `Early -22 ms`, input `-22`, and step badge `3-22`.
- Playback advanced to Bar 1.2 / Step 6, Stop returned Ready / 2 bar loop, and export meter stayed non-silent: Hot, peak -3.4 dB, RMS -20.8 dB, headroom 0.4 dB, limiter 0.00%.
- Console error log count was 0.

## Findings

No blocking findings.

## Notes

- Turning a drum step off resets its timing to 0 ms so hidden timing does not surprise beginners later.
- Timing offsets are clamped to +/-35 ms and stay in pattern data alongside drum velocity and hat repeat.

## Residual Risk

This is per-hit timing, not a full groove template engine. Future groove work should add lane-level groove templates, swing quantize strength, probability, flam, and a wider piano-roll timing view once the current event model remains stable.
