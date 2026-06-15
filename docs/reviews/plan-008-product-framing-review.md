# plan-008-product-framing Review

## Summary

The change keeps GrooveForge framed as a direct beat-composition mini DAW: all-genre pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixing/mastering, and export. Sampling remains documented only as an optional later extension and as a safety/licensing concern.

## QA

- `rg -n "샘플링|샘플|sampling|sample|sampler|샘플러" README.md AGENTS.md docs harness`
  - Remaining matches reviewed and accepted as optional-extension, safety/licensing, QA guardrail, or historical-plan context.
- `python3 harness/scripts/run_qa.py`
  - Passed.
- `python3 harness/scripts/run_quality_gate.py`
  - Passed.

## Findings

- No blocking findings.
- The product docs now state that direct composition is the product spine and that a sample-free beat remains the MVP proof.
- The quality rules now require any sample import/chop/sampler/warping plan to mark itself as optional sampling-phase work or document a user-approved exception.

## Residual Risk

Future UI copy and implementation plan names can still drift if they are written outside the harness expectations. Continue searching for sampling terminology during product-framing, roadmap, and feature-planning work.
