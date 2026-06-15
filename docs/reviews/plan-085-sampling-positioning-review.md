# plan-085-sampling-positioning Review

## Summary

Completed. The durable project draft now states the corrected concept more directly: GrooveForge is an all-genre beat-production mini DAW for direct beat composition, sound design, arrangement, mixing/mastering, and export. Sampling remains explicitly allowed only as a later optional sound source or instrument layer inside the beat workstation.

## QA

- Passed: `rg -n -i "sample|sampling|sampler|audio clip|AudioClip|chop|slice|stretch|샘플|샘플링" README.md AGENTS.md docs/architecture docs/product docs/quality harness/scripts/run_qa.py`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run verify`
- Passed: `npm run qa`
- Passed: `git diff --check`

## Findings

- None.

## Residual Risk

- Historical completed plans and reviews still mention sampling in guardrail/non-goal contexts. They were intentionally left unchanged because they are audit history, not current product direction.

## Follow-Ups

- Continue rejecting new MVP, first-run, architecture, or plan wording that makes sample import, chopping, sampler setup, audio clips, or audio warping the default way to start a beat.
