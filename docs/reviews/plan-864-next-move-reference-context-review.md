# plan-864-next-move-reference-context Review

## Result

Pass.

## Scope Reviewed

- Command Reference Next Move row target and static context.
- Command Reference search, Search Spotlight, title, and aria-label context coverage.
- README, product docs, quality rules, and QA harness expectations.

## Findings

- None open.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: Vite reported the existing large chunk warning during build and verify.

## Notes

- Next Move is now discoverable in Command Reference with readiness/export-driven recommendation posture, explicit action, route, before/after posture, selected Delivery Target, readiness/export/stem posture, audition cue, and next-check context before users open Quick Actions, while preserving static read-only reference behavior, recommendation derivation, action ordering, action definitions, explicit action handlers, project data, playback, export, audio-analysis boundaries, and sampling scope.
