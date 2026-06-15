# plan-007-pattern-variations Review

## Summary

Pattern A/B/C are now real editable pattern stores instead of a cosmetic selector. The UI edits the selected pattern, realtime playback previews that selected pattern, and WAV export follows the arrangement blocks' pattern assignments.

## QA

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- Browser check at `http://127.0.0.1:5173/`: passed. Adding an 808 note to Pattern B changed B from 33 to 34 events, Pattern A stayed at 27 events with the note absent, returning to Pattern B showed the note persisted, playback ran on the selected pattern, and no browser console errors were reported.

## Findings

- No blocking findings.

## Residual Risk

- Export is arrangement-aware in code and covered by build/static checks, but automated WAV content comparison by pattern has not been added yet.
- Arrangement blocks can use A/B/C, but the arrangement itself is not yet editable in the UI.
- Legacy project migration clones the old single loop into A/B/C to preserve prior sound; it does not infer distinct variations.

## Follow-Ups

- Add an automated render test that proves arrangement block pattern assignments produce different audio.
- Add arrangement editing controls for changing block pattern, section, and energy.
- Add copy/duplicate pattern commands so users can quickly derive B/C from A.
