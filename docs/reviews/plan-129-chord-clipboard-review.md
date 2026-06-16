# plan-129-chord-clipboard Review

## Summary

Selected-chord clipboard adds explicit Copy and Paste controls to the Chord Editor. Copy stores the selected chord event's root, quality, inversion, step, length, velocity, and chance shape in UI-local state only. Paste writes that shape into the selected Pattern A/B/C at the next empty chord step through the existing undoable current-pattern update path, selects the pasted chord, and keeps it editable through the existing chord controls.

## QA

- `npm run qa` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser smoke passed at `1180px`: switched to Studio mode, confirmed `Clipboard empty` with Paste disabled, selected and copied `Fmin`, confirmed `Clipboard Fmin.1` with Paste enabled, executed focused Paste, confirmed chord slots increased to `8`, the pasted chord was selected, Undo remained enabled, console errors were empty, and horizontal overflow was false.

## Findings

- No blocking issues found.

## Residual Risk

- The clipboard is intentionally session-local and can be pasted into the currently selected Pattern A/B/C slot after switching patterns. This matches the plan, but future multi-chord editing should revisit cross-pattern paste affordances.
- In the in-app Browser smoke, mouse dispatch to the Paste button timed out in the browser automation layer after Copy had focused/enabled the button; pressing Enter on the focused Paste button triggered the same button action and verified the application path.

## Follow-Ups

- Multi-chord copy/paste, range paste, and drag selection remain out of scope for this plan.
