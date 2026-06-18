# plan-380-selected-chord-length-reset review

## Status

completed

## Scope

Added a Quick Action that resets the active selected chord length to the core 4-step chord length, capped by the remaining selected Pattern A/B/C grid from the chord start step.

## QA

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run qa`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5187` failed with `listen EPERM: operation not permitted 127.0.0.1:5187`, and the escalated retry was rejected by environment policy.

## Findings

None.

## Notes

- The reset action is disabled when no active selected chord exists or the chord already matches the capped 4-step target length.
- The reset target is derived from the core 4-step chord length capped by remaining selected Pattern A/B/C grid space.
- The reset action routes through the existing selected-chord length update path.
- Root, quality, inversion, step, velocity, chance, selection, undo behavior, playback, WAV/stem/MIDI export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync boundaries are preserved.
