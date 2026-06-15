# plan-014-stem-export Review

## Summary

Stem export is now available from the transport command strip. The app exports isolated drum, 808, synth, and chord WAV files from the current arrangement while preserving the existing full-mix WAV export path.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser verification passed on `http://127.0.0.1:5173/`: clicked `Stems`, confirmed `Exported 4 stems`, started playback afterward, and observed no console errors.

## Findings

- No blocking findings.

## Residual Risk

- Stems are downloaded as separate WAV files, not packaged into a ZIP or saved through a native folder picker.
- The stem renderer still shares the lightweight synthetic engine from full-mix export, so it is useful for workflow but not yet a professional DSP engine.
- Browser validation confirms UI state and no console errors; it does not inspect downloaded audio bytes in this pass.

## Follow-Ups

- Add a native desktop folder export or ZIP packaging path when the file workflow is ready.
- Add automated WAV byte inspection for stem count, duration, channel count, and non-silence.
- Add peak/LUFS metering so exported mix and stems can be checked before delivery.
