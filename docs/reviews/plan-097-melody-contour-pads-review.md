# plan-097-melody-contour-pads review

## Findings

None.

## Open Questions

None.

## Review Notes

- Melody Contour Pads are explicit local controls for Rise, Fall, Answer, and Anchor shapes.
- `applyMelodyContour` updates only the selected Pattern A/B/C Synth melody notes through the existing undoable pattern update path.
- The contour helpers preserve melody note count and step positions while changing pitch contour, length, velocity, and chance from deterministic presets.
- The implementation keeps results editable through the existing note grid and inspector and does not add sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

## Verification

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke at `http://127.0.0.1:5205/`: four Melody Contour buttons rendered, Fall changed Synth pitches while preserving five notes and steps `[1,4,7,11,13]`, and no horizontal overflow appeared.
- `npm run qa`
- `git diff --check`
