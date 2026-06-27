# plan-1009-pattern-contrast-section-fit-decision

## Goal

Add a Pattern Contrast Section Fit Decision action that recommends the next explicit step for the selected arrangement section: cue the block when the role already fits, use an available expected role Pattern when it does not, or review/build roles when no safe action exists.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. This gives first-time composers a clear next move after reading Section Fit and lets working producers move quickly from diagnosis to listening or placement without hunting through separate commands. The action reuses existing Section Fit Cue and Pattern Use routes and does not add sampling, imported audio, sampler setup, hidden generation, autoplay, export, remote AI, accounts, analytics, or cloud sync.

## Scope

- Add a visible Section Fit Decision button that routes to explicit cue or use behavior only when available.
- Add a Quick Actions Section Fit Decision command with local result metrics and follow-up text.
- Keep separate Cue and Use controls intact for direct producer control.
- Update README, product/quality docs, and harness expectations.

## Non-Goals

- No Pattern event mutation, generated notes, automatic arrangement, or hidden macro chain.
- No playback start, export, render, save/load, or project schema change.
- No sampling, audio import, sampler device, remote AI, accounts, analytics, payments, or cloud sync.

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

- 2026-06-27: Keep the Decision action explicit. It may choose between existing Cue and Use paths, but only after a user click or direct Quick Action run.
- 2026-06-27: Completed after QA, typecheck, quality gate, build, full QA, and verify passed.

## Status

- Completed.
