# plan-1006-pattern-contrast-section-fit

## Goal

Add a read-only Pattern Contrast Section Fit readout so users can compare the intended arrangement section shape with the current Anchor, Lift, Break, and Switchup pattern roles before they edit or place another pattern.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. This helps first-time composers understand whether sections have an appropriate contrast role and helps working producers scan form problems quickly. It does not add sampling, imported audio, sampler setup, generation, autoplay, export, remote AI, accounts, analytics, or cloud sync.

## Scope

- Derive section-fit diagnostics from existing Pattern Contrast role summaries and local arrangement blocks.
- Show the section-fit readout near Pattern Contrast without changing arrangement or Pattern data.
- Add a Quick Actions section-fit readout command with local result metrics and follow-up text.
- Update README, product/quality docs, and harness expectations.

## Non-Goals

- No arrangement mutation, no automatic placement, no generated notes, and no pattern event mutation.
- No autoplay, playback start, export, render, save/load, or project schema change.
- No sampling, audio import, sampler device, remote AI, accounts, analytics, payments, or cloud sync.

## Validation Plan

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Decision Log

- 2026-06-27: Keep Section Fit read-only. It should turn existing arrangement labels and Pattern Contrast roles into a form diagnostic, not infer or rewrite song form.

## Status

- Completed.
