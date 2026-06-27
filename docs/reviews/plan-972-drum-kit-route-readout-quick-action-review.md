# plan-972-drum-kit-route-readout-quick-action Review

## Summary

Plan 972 adds a read-only Drum Kit Route Readout Quick Action. The action focuses the existing Sound panel, reports the built-in kick/clap/hat kit route for the current Drum Kit preview target, returns UI-local result metrics, and does not call Drum Kit apply handlers or mutate project data.

## Findings

- No findings after review.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Notes

- Drum Kit Readout, Drum Kit Route Readout, Drum Kit Decision, current Drum Kit, and direct kit pad commands remain separate command paths.
- Sampling stays out of scope; the new readout derives from local Drum Kit preview data, sound/mixer posture, and local project context only.
