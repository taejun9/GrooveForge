# plan-021-beat-first-positioning-review

## Summary

The docs now make GrooveForge read as a beat-first, all-genre mini DAW: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixing/mastering, and export are the core workflow. Sampling is still documented, but only as a later optional module.

## QA

- `rg -n -i "sample|sampling|sampler|audio clip|AudioClip|chop|slice|stretch|trap|serato" README.md AGENTS.md docs harness`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`

All validation passed.

## Findings

No blocking findings.

## Notes

- Remaining sampling references are optional-extension, safety/licensing, static QA, or historical completed-plan context.
- `Clip` is now clarified in architecture/product docs as a pattern, MIDI, or automation container before the optional sampling phase.
- Browser validation was not run because this plan changes documentation and harness expectations only.

## Residual Risk

Future feature plans can still drift through new UI copy or plan titles. The strengthened QA expectations reduce that risk, but product-framing searches should continue whenever sampling-related features are discussed.
