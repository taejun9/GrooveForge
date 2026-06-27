# plan-1011-section-fit-style-reasons

## Goal

Add style-specific Section Fit reason text so users can understand why the current style expects Anchor, Lift, Break, or Switchup roles in each arrangement section.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. Beginners get a plain reason for each section expectation, while working producers can scan the same local rationale before cueing or assigning a role. Sampling remains secondary and out of scope.

## Scope

- Add local style-specific Section Fit reason metadata for supported style profiles.
- Surface the reason in visible Section Fit cards and Quick Actions result/follow-up metrics.
- Keep Section Fit readout, Decision, Cue, and Use explicit and routed through existing handlers.
- Update README, product/quality docs, and QA harness expectations.

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

- 2026-06-28: Keep reasons as local read-only explanation. They should clarify Section Fit expectations without becoming an auto-arranger or sampling workflow.
- 2026-06-28: Completed after QA, typecheck, quality gate, build, full QA, and verify passed.

## Status

- Completed.
