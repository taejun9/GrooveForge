# plan-376-selected-chord-inversion-reset review

## Status

completed

## Scope

Added a Quick Action that resets the active selected chord inversion to root position inside the selected Pattern A/B/C slot.

## QA

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `npm run qa`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5183` failed with `listen EPERM: operation not permitted 127.0.0.1:5183`, and the escalated retry was rejected by policy.

## Findings

None.

## Notes

- The reset action is disabled when no selected chord exists or the selected chord is already root position.
- The reset action routes through `updateChordEvent(selectedChordIndex, { inversion: 0 }, "Reset chord voicing")`.
- Root, quality, timing, length, velocity, chance, playback, export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync are unchanged.
