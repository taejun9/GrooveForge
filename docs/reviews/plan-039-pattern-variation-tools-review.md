# plan-039-pattern-variation-tools-review

## Summary

Pattern tools now include deterministic Subtle, Hook, and Break variation buttons. Each preset transforms only the selected Pattern A/B/C slot as editable drum, bass, melody, chord, velocity, timing, repeat, and probability data. The feature supports fast direct composition without sampling, remote AI, or hidden audio assets.

## QA

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser smoke passed on `http://127.0.0.1:5173/`: Subtle, Hook, and Break buttons were present; Hook changed Pattern A from 34 to 41 events and undo restored 34; Subtle changed Pattern A to 35 events; Break changed Pattern A to 15 events; Pattern B/C counts stayed unchanged; playback started and stopped; console errors were empty.

## Review Findings

No blocking findings.

## Residual Risk

- Variations are rule-based and intentionally conservative. More genre-specific variation recipes can be added after the core workflow has enough user feedback.
- Applying multiple variations in sequence compounds edits. This is undoable, but a later compare or snapshot workflow would make deeper exploration easier.

## Follow-Ups

- Add target-slot generation such as "Make B from A" once the current selected-pattern variation workflow is proven.
- Add direct before/after audition or pattern compare controls for producer workflows.
