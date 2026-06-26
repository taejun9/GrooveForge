# plan-934-arrangement-move-readout-quick-action Review

## Summary

Arrangement Move now has a dedicated read-only Quick Action that focuses the existing Arrange panel, reports the selected-block Drop/Build/Hook Lift suggestion, section, Pattern A/B/C assignment, bar length, energy, muted-track posture, selected Pattern context, editable event count, and next manual move check without applying a move.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Findings

- No blocking findings.

## Residual Risk

- Arrangement Move now has separate readout and decision paths. Future arrangement work should keep `arrangement-move-readout-action` non-mutating and route energy and mute changes only through the existing undoable Arrangement Move apply handler.

## Follow-Ups

- Continue the plan-931 through plan-940 block with the highest remaining gap toward a producer-ready and beginner-readable direct beat workstation.
