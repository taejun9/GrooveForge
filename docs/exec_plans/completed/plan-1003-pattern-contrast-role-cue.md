# plan-1003-pattern-contrast-role-cue

## Goal

Add role-based Pattern Contrast cue actions so users can audition the current Anchor, Lift, Break, and Switchup patterns directly from the Pattern Contrast readout and Quick Actions without mutating Pattern A/B/C musical event data.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. This work improves direct beat composition by helping beginners and working producers hear how pattern roles differ in the arrangement. It does not add sampling, imported audio, sampler setup, generation, autoplay, export, or schema changes.

## Scope

- Add visible Pattern Contrast role cue buttons that call the existing Pattern Cue handler for each non-blank role slot.
- Add direct Quick Actions for cueing the current Anchor, Lift, Break, and Switchup role slots.
- Add local Quick Action result metrics and follow-up text for role cue commands.
- Update README, product/quality docs, and harness expectations for the role cue path.

## Non-Goals

- No pattern data mutation, arrangement mutation, generated notes, hidden variations, or auto-arrangement.
- No autoplay, transport start, export, render, save/load, or project schema change.
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

- 2026-06-27: Use the existing Pattern Cue route instead of introducing a new playback or mutation path. Role cue commands should only select the role's Pattern A/B/C and set Pattern loop scope through the established cue handler.

## Status

- Completed.
