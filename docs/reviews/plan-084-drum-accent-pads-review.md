# plan-084-drum-accent-pads-review

## Summary

Drum Accent Pads add a deterministic velocity-shaping row to the Pattern editor. Soft, Knock, Ghost, and Lift pads update only active drum velocities in the selected Pattern A/B/C slot through the existing undoable project update path. The feature helps beginners make programmed drums hit with clearer dynamics in one explicit click, while giving working producers fast editable velocity starting points without sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

## QA

- `npm run typecheck`
- `npm run verify`
- `npm run qa`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- Browser smoke at `http://127.0.0.1:5193/`: Knock accent kept active drums at 18, active notes at 9, and chord slots at 4; changed visible active-step velocity values; undo restored the previous Pattern state; console errors were empty; and horizontal overflow was false.

## Findings

No blocking findings.

## Residual Risk

- Accent pads are deterministic broad velocity shapes. Future work can make them style-aware, but they should remain explicit, undoable, and editable local event transformations.
- Drum Accent Pads intentionally edit velocity only. They do not rewrite drum patterns, timing, chance, notes, chords, arrangement, mixer, sound design, or export semantics.

## Follow-ups

- Consider a later style-aware Drum Accent plan that maps velocity defaults to the selected genre profile while preserving selected Pattern scope, active drum counts, and manual editability.
