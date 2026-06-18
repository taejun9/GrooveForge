# plan-378-selected-note-length-reset review

## Status

completed

## Scope

Added a Quick Action that resets the active selected 808/Synth note length to the current Keyboard Capture default length for that track inside the selected Pattern A/B/C slot.

## QA

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run qa`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5185` failed with `listen EPERM: operation not permitted 127.0.0.1:5185`, and the escalated retry was rejected by environment policy.

## Findings

None.

## Notes

- The reset action is disabled when no active selected note exists or the note already matches the current track Keyboard Capture default length.
- The reset target is derived only from the selected note track's Keyboard Capture length default.
- The reset action routes through the existing selected-note length update path.
- Step, pitch, glide, velocity, chance, selection, undo behavior, playback, WAV/stem/MIDI export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync boundaries are preserved.
