# plan-004-audio-scheduler Review

## Summary

The preview path now uses a realtime Web Audio scheduler instead of rendering a complete preview buffer before playback. The app keeps WAV export on the offline render path while adding transport step feedback to the drum and note grids.

## QA

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- Browser check at `http://127.0.0.1:5173/`: passed. Play switched to Stop, the displayed step advanced from 3 to 7 to 12, and Stop reset the UI to Ready with no playhead.

## Findings

- No blocking findings.

## Residual Risk

- The scheduler is still an MVP Web Audio implementation, not a pro native audio engine.
- Playback uses the current project snapshot at the time Play is pressed; live project edits during playback are not yet rescheduled.
- Browser automation confirmed UI state progression, but it does not measure audio jitter or long-session drift.

## Follow-Ups

- Add scheduler drift tests or a diagnostic transport log before deeper arrangement work.
- Decide how project edits should behave during active playback.
- Extend playback coverage to BPM changes once the transport can update project state while running.
