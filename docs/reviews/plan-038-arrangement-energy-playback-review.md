# plan-038-arrangement-energy-playback-review

## Summary

Arrangement block Energy is now audible project data. A shared domain helper converts block Energy into deterministic gain, realtime arrangement playback uses that gain while scheduling, and offline WAV/stem export uses the same rule. Pattern preview stays at neutral energy so editing a selected pattern remains predictable.

## QA

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser smoke passed on `http://127.0.0.1:5173/`: Energy readout changed from `0.45x` to `1.12x`, export RMS changed between low and high Energy, arrangement playback started and stopped, and console errors were empty.

## Review Findings

No blocking findings.

## Residual Risk

- Energy currently works as a gain interpretation, not full density automation. A later arrangement automation plan can add per-lane or per-device energy rules if needed.
- Peak readout can remain pinned at the master ceiling when the limiter is active, so QA should use RMS or limiter activity when checking Energy impact.

## Follow-Ups

- Add section-level automation or lane thinning after the core workstation loop is stable.
- Consider an A/B export comparison harness if offline render tests become first-class.
