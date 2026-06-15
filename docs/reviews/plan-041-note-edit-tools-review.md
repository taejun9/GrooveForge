# plan-041-note-edit-tools Review

## Summary

Selected-note edit tools are implemented for Studio mode. 808 and Synth notes can now move by step, move by scale pitch, jump by octave, and duplicate to the next empty step without deleting and re-clicking notes.

## QA

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test on `http://127.0.0.1:5173/`: rendered the seven note tool buttons, moved a selected 808 note by step/pitch/octave, duplicated it, verified Pattern A count changed only on duplicate, verified Undo restored the count, started/stopped playback, and confirmed console warning/error logs were empty.

## Findings

- No blocking findings.
- The tools operate on the selected Pattern A/B/C slot through the existing undoable project update path.
- Duplicate preserves note fields and avoids same-step/same-pitch overlap.
- Pitch moves use scale-derived pitch lanes and octave moves preserve the current scale note name.
- No sampling, remote AI, imported audio, or hidden audio assets were introduced.

## Residual Risk

- This is still a compact grid editor rather than a full piano roll. Drag editing, multiselect, copy/paste buffers, and MIDI entry remain future work.

## Follow-Ups

- Add richer note gestures such as drag length, keyboard note entry, and multiselect once the compact grid tools remain stable.
