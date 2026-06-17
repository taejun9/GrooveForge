# plan-239-sampling-secondary-positioning Review

## Summary

The current product surface was audited against the user's clarification that GrooveForge is for all-genre beat creation and not a sampling-first app. The runtime app/domain model already kept the core track union sample-free, so this slice tightened durable docs and static QA rather than changing UI behavior.

The completed change strengthens README, product, architecture, quality, and QA rules so external draft examples with `AudioClipEvent`, `audio`, `sampler`, or a default Instrument Panel `sampler` are rewritten into optional sampling-phase sections before they can become MVP architecture.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- Targeted sampling-positioning audit passed: current app/domain surface does not expose sampling as the main workflow; remaining sampling terms are guardrails, sample-free proof text, or optional-extension boundaries.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed.
- `npm run verify` passed, including runtime smoke coverage for 10/10 Beat Blueprints and 10/10 supported style profiles as sample-free 8-bar beats.

## Findings

- No findings. The edits preserve the beat-first product definition, keep sampling optional, and add a domain-model QA check so `audio`, `sampler`, and `AudioClipEvent` cannot enter the core MVP model unnoticed.

## Residual Risk

- The targeted audit is text-based. Future UI changes should still be reviewed visually if they add any sound-source, browser, clip, or device-palette surface.
- Historical completed plan records still contain older sampling-related terms as work history; this review treats them as immutable records rather than current product framing.

## Follow-Ups

- If optional sampling work is explicitly approved later, create a dedicated optional sampling-phase plan that preserves sample-free project creation, playback, save/load, and export.
