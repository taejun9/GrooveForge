# plan-121-sampling-extension-core Review

## Summary

Plan 121 tightened the beat-first product boundary after auditing the attached draft. Product, architecture, and quality docs now explicitly keep `AudioClipEvent`, `audio`, and `sampler` out of core MVP event, clip, track, and default-project examples unless an optional-sampling phase is explicitly approved.

## QA

- Targeted `rg` audit for `AudioClipEvent`, core event union, MVP type examples, default project track list, and extension-track language passed.
- `git diff --check` passed.
- `npm run qa` passed.
- `npm run verify` passed.

## Findings

- No blocking issues found.

## Residual Risk

- Future optional-sampling work still needs its own explicit plan and should keep sample-free beat creation, playback, save/load, and export intact.

## Follow-Ups

- None required for this correction.
