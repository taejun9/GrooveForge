# plan-1004-pattern-contrast-role-use

## Goal

Add role-based Pattern Contrast Use actions so users can place the current Anchor, Lift, Break, or Switchup pattern into the selected arrangement block directly from the role language they are hearing.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. This work helps first-time composers arrange by musical role and helps working producers move quickly from contrast audition to section placement. It does not add sampling, imported audio, sampler setup, generation, autoplay, export, remote AI, accounts, analytics, or cloud sync.

## Scope

- Add visible Pattern Contrast role Use buttons for non-blank role slots.
- Route visible role Use clicks through the existing Pattern Use handler for the selected arrangement block.
- Add Quick Actions for using Anchor, Lift, Break, and Switchup role slots in the selected block.
- Add local result metrics and follow-up text for role Use commands.
- Update README, product/quality docs, and harness expectations for the role Use path.

## Non-Goals

- No pattern event mutation, generated notes, hidden variations, or automatic arrangement.
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

- 2026-06-27: Use the existing selected-block Pattern Use route instead of adding a new arrangement mutation path. Role Use should only change the selected block assignment through the established handler and keep Pattern A/B/C event data unchanged.

## Status

- Completed.
