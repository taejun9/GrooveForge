# plan-127-note-clipboard Review

## Summary

Selected-note clipboard adds explicit Copy and Paste controls to the Studio Note Inspector for 808 and Synth notes. Copy stores the selected note shape in UI-local state only. Paste writes a new note to the copied track's next empty step through the existing undoable Pattern A/B/C update path, selects the pasted note, and keeps the pasted event manually editable.

## QA

- `npm run qa` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser smoke passed at `1180px`: selected `808 F1 step 1`, copied it, confirmed `Clipboard 808 F1.1`, pasted `808 F1 step 2`, confirmed pasted-note selection and Undo enabled, verified existing move/transpose/octave/duplicate controls still render, no console errors, and no horizontal overflow.

## Findings

- No blocking issues found.

## Residual Risk

- Clipboard state intentionally remains session-local and can be pasted into the currently selected Pattern A/B/C slot even after switching patterns. This matches the plan, but later multi-select or full piano-roll work should revisit cross-pattern paste affordances if broader edit scopes are added.

## Follow-Ups

- Multi-note copy/paste and drag selection remain out of scope for this plan.
