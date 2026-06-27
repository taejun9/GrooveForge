# plan-1005-pattern-contrast-role-map

## Goal

Add a read-only Pattern Contrast Role Map so users can see where Anchor, Lift, Break, and Switchup patterns are already placed across the arrangement before they cue, use, or edit another pattern.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. This work helps first-time composers understand song structure through role labels and helps working producers scan arrangement coverage quickly. It does not add sampling, imported audio, sampler setup, generation, autoplay, export, remote AI, accounts, analytics, or cloud sync.

## Scope

- Derive an arrangement role map from existing Pattern Contrast role summaries plus local arrangement blocks.
- Show the role map near Pattern Contrast without changing arrangement or Pattern data.
- Add a Quick Actions role-map readout command with local result metrics and follow-up text.
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

- 2026-06-27: Keep Role Map read-only. It should turn existing Pattern A/B/C role labels and arrangement blocks into scan context, not infer or rewrite song form.

## Status

- Completed.
