# plan-377-selected-note-pitch-reset review

## Status

completed

## Scope

Added a Quick Action that resets the active selected 808/Synth note pitch to the current Keyboard Capture default pitch inside the selected Pattern A/B/C slot.

## QA

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run qa`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5184` failed with `listen EPERM: operation not permitted 127.0.0.1:5184`, and the escalated retry was rejected by environment policy.

## Findings

None.

## Notes

- The reset action is disabled when no active selected note exists, the note already matches the default pitch, or another note occupies the target step/pitch.
- The reset target is derived from current key, selected note track, and that track's Keyboard Capture octave default.
- The reset action routes through `moveSelectedNoteTo(selectedNote.step, defaultPitch, "Reset note pitch")`.
- Step, length, glide, velocity, chance, selection, undo behavior, playback, WAV/stem/MIDI export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync boundaries are preserved.
