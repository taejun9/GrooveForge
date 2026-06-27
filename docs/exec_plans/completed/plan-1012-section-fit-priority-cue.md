# plan-1012-section-fit-priority-cue

## Goal

Add an explicit Pattern Contrast Section Fit Priority Cue so users can immediately audition the highest-priority section-fit issue before changing arrangement roles.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. Beginners get a clear first listening target, while working producers can quickly cue the most suspicious section before deciding whether to use a different Pattern role. Sampling remains secondary and out of scope.

## Scope

- Derive a local Section Fit priority item from missing-role and mismatch states.
- Surface the priority item and style reason in visible Section Fit and Quick Actions metrics.
- Add an explicit visible and Quick Actions Priority Cue that routes only through the existing arrangement block cue handler.
- Update README, product/quality docs, and QA harness expectations.

## Non-Goals

- No automatic arrangement, hidden generation, Pattern event mutation, selected-block Pattern assignment, or command chaining.
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

- 2026-06-28: Priority Cue may select/cue a block only after explicit click or Quick Action run. It must not assign Patterns or change arrangement data.
- 2026-06-28: Completed after QA, typecheck, quality gate, build, full QA, and verify passed.

## Status

- Completed.
