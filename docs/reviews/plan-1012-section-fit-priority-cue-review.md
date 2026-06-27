# plan-1012-section-fit-priority-cue review

## Summary

Plan 1012 adds an explicit Pattern Contrast Section Fit Priority Cue. The visible Section Fit follow-up and Quick Actions now identify the highest-priority issue, prefer missing-role blocks before mismatches, and route audition through the existing arrangement block cue handler without mutating Pattern data or arrangement state.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Findings

- None.

## Residual Risk

- Priority selection is intentionally local and heuristic. It highlights the clearest missing-role or mismatch issue, but it does not replace a producer's final arrangement judgment.

## Follow-Ups

- Continue improving listening-first arrangement decisions before optional sampling work.
- Consider deeper section-priority metadata only if it remains local-first, explicit, and read-only until the user applies a change.
