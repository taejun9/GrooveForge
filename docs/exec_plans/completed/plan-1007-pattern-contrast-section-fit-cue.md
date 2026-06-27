# plan-1007-pattern-contrast-section-fit-cue

## Goal

Add an explicit Pattern Contrast Section Fit Cue action so users can immediately audition the selected arrangement block as a Block loop while reviewing whether its section role fits the current Anchor, Lift, Break, or Switchup pattern role.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. This helps first-time composers hear why a section role matters and gives working producers a faster loop-check path from the Section Fit diagnostic. It reuses the existing selected-block cue path and does not add sampling, imported audio, sampler setup, generation, autoplay, export, remote AI, accounts, analytics, or cloud sync.

## Scope

- Add a visible Section Fit Cue button inside the Pattern Contrast readout for the selected arrangement block.
- Add a Quick Actions Section Fit Cue command that routes only through the existing arrangement block cue handler.
- Add local Quick Action result metrics and follow-up text for the cue action.
- Update README, product/quality docs, and harness expectations.

## Non-Goals

- No arrangement mutation, no automatic placement, no generated notes, and no pattern event mutation.
- No autoplay, export, render, save/load, or project schema change.
- No new playback engine behavior, sampling, audio import, sampler device, remote AI, accounts, analytics, payments, or cloud sync.

## Validation Plan

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Decision Log

- 2026-06-27: Reuse the existing arrangement block cue path. Section Fit Cue should select the block and set Block loop scope only after an explicit user action, leaving Pattern and arrangement data unchanged.

## Status

- Completed.
