# plan-1008-pattern-contrast-section-fit-use

## Goal

Add an explicit Pattern Contrast Section Fit Use action so users can apply an available expected Anchor, Lift, Break, or Switchup Pattern to the selected arrangement block after reviewing the Section Fit diagnostic.

## Product Fit

GrooveForge remains an all-genre, event-based beat workstation. This helps first-time composers move from section-role diagnosis to a concrete arrangement correction and helps working producers repair form mismatches quickly. The action reuses the existing selected-block Pattern Use route and does not add sampling, imported audio, sampler setup, hidden generation, autoplay, export, remote AI, accounts, analytics, or cloud sync.

## Scope

- Add Section Fit expected-role metadata so the selected section can identify a matching Pattern Contrast role.
- Add a visible Section Fit Use button that routes only through the existing selected-block Pattern Use handler.
- Add a Quick Actions Section Fit Use command with local result metrics and follow-up text.
- Update README, product/quality docs, and harness expectations.

## Non-Goals

- No Pattern event mutation, generated notes, automatic arrangement, or hidden macro chain.
- No playback start, export, render, save/load, or project schema change.
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

- 2026-06-27: Keep Section Fit Use explicit. The button and Quick Action may change only the selected arrangement block's Pattern through the existing Pattern Use handler, and only when an expected role Pattern is available.

## Status

- Completed.
