# plan-082-pattern-stack-pads-review

## Summary

Pattern Stack Pads add a deterministic, key-aware composition row to the Pattern editor. Pocket, Hook, Lift, and Break pads combine existing 808 Bassline, chord progression, and Melody Motif generation into one explicit click that replaces only the selected Pattern A/B/C 808, chord, and Synth melody events through the existing undoable project update path. The feature helps beginners get a coherent musical idea quickly and helps producers sketch A/B/C variations faster without sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

## QA

- `npm run typecheck`
- `npm run verify`
- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `git diff --check`
- Browser smoke at `http://127.0.0.1:5190/`: Hook stack changed 808 notes from 4 to 6, Synth melody notes from 5 to 6, changed chord event data while keeping 4 chord events, safely selected the first chord, undo restored the previous Pattern events, console errors were empty, and horizontal overflow was false.

## Findings

No blocking findings.

## Residual Risk

- Stack pads intentionally use deterministic starter combinations. Future work can make the combinations style-aware, but they should remain editable local event transformations rather than hidden generation or sample-pack workflows.
- Stack pads currently leave drums untouched. That keeps this slice narrow and avoids drum-generation rewrites, but future section-aware stack plans may coordinate drums if they preserve editable Pattern event semantics.

## Follow-ups

- Consider a later style-aware Pattern Stack plan that picks bassline, chord, and motif combinations from the selected genre profile while keeping all results editable and undoable.
