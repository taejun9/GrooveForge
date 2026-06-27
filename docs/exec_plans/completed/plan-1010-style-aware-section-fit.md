# plan-1010-style-aware-section-fit

## Goal

Make Pattern Contrast Section Fit expectations style-aware so section-role guidance reflects the current beat profile instead of one broad arrangement heuristic.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. Beginners get more accurate section guidance for the style they are writing, while working producers can trust the Section Fit diagnostic as a faster arrangement check. Sampling remains secondary and out of scope.

## Scope

- Derive Section Fit expected roles from the selected style profile when possible.
- Surface the style-aware basis in visible Section Fit and Quick Actions result metrics.
- Keep Section Fit Decision, Cue, and Use explicit and routed through existing handlers.
- Update README, product/quality docs, and harness expectations.

## Non-Goals

- No automatic arrangement, hidden generation, Pattern event mutation, or command chaining.
- No playback start, export/render output, save/load schema change, or undo-history change.
- No sampling, imported audio, sampler device, remote AI, accounts, analytics, payments, cloud sync, or external services.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

Note: `npm run build` and `npm run verify` report the existing Vite chunk-size warning for `workstation-app-quick-actions`, but both commands exit successfully.

## Decision Log

- 2026-06-28: Use local style profile/project state only. Section Fit should become more style-aware without becoming an auto-arranger.
- 2026-06-28: Completed after QA, typecheck, quality gate, build, full QA, and verify passed.

## Status

- Completed.
