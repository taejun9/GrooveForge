# plan-457-arrangement-map-focus-results

## Status

Completed

## Owner

박자

## Goal

Add UI-local Focus Result feedback for Arrangement Mute Map and Arrangement Transition Map focus commands so explicit focus clicks and Quick Actions confirm the focused lane or transition, destination, arrangement metric, audition cue, and next check without changing project data.

## Context

Arrangement Mute Map and Arrangement Transition Map help users read song structure, layer drops, builds, and adjacent-block handoffs. They already support focus buttons and Quick Actions, but focus-only commands currently only update the readout and scroll to Arrange. Most recent focus surfaces now show a local Focus Result after explicit focus commands.

## Scope

- Add `ArrangementMuteMapFocusResult` and `ArrangementTransitionMapFocusResult` UI models.
- Show Focus Result strips only after explicit visible focus clicks or Quick Action focus/lane/transition commands.
- Clear stale arrangement-map focus results on project mutation, project replacement, undo/redo restore paths, and Transition Loop cueing.
- Update README, product docs, quality rules, and QA harness expectations for the UI-local focus-result contract.

## Non-Goals

- Do not change Arrangement Mute Map or Arrangement Transition Map derivation, scoring, order, focus target, cue behavior, playback, saved project schema, or undo history.
- Do not change arrangement edits, Arrangement Focus, Arrangement Template, Arrangement Arc, Structure Lens, Song Form Overview, Beat Map, Hook Readiness, Topline Space, Review Queue, Mix Coach, Handoff Pack, export, or direct editing semantics.
- Do not add auto-fills, auto-muting, auto-arrangement, autoplay, hidden generation, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Decision Log

- 2026-06-19: Pair Arrangement Mute Map and Arrangement Transition Map in one plan because both are UI-local arrangement readability surfaces with the same focus-only feedback gap.
- 2026-06-19: Keep Transition Loop cue separate from focus-result semantics by clearing stale Arrangement Map focus results when cueing a transition.

## Checklist

- [x] Inspect the current arrangement map implementations and QA contract.
- [x] Add focus-result models, state, rendering, helper copy, and reset behavior.
- [x] Update docs and harness expectations.
- [x] Run required QA and review after QA passes.
- [x] Move this plan to completed and create the review mirror.

## Implementation Summary

- Added `ArrangementMuteMapFocusResult` and `ArrangementTransitionMapFocusResult` UI-local result models.
- Added focus-result state, reset behavior, and result generation for explicit Arrangement Mute Map and Arrangement Transition Map focus clicks and Quick Action focus/lane/transition commands.
- Added result strips with focused lane or transition, Arrange destination, arrangement metric, audition cue, and next-check feedback.
- Cleared stale arrangement-map focus results on project mutation, project replacement, undo/redo restore, and Transition Loop cueing.
- Updated README, product docs, quality rules, and QA harness expectations for the local Focus Result contract.

## QA Results

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed.
- `npm run qa` passed.
- `npm run verify` passed.
- Browser visual check was not run because the in-app Browser control tool was not exposed in this session.

## Review Summary

- No blocking issues found after QA.
- Residual risk: visual browser inspection was unavailable, so layout verification is covered by build/type/QA only in this run.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser visual check if an in-app Browser control tool is available.
