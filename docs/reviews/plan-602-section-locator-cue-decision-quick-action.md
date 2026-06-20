# plan-602-section-locator-cue-decision-quick-action review

## Summary

Completed the Quick Actions Section Locator Cue Decision command for the Transport/Arrange command palette. The change keeps section audition inside the direct beat-composition workflow, reuses the visible Section Locator Cue Decision target, and keeps sampling/imported-audio scope out of the plan.

## QA

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke with `curl -I http://127.0.0.1:5173/` returning `HTTP/1.1 200 OK`

## Review Findings

No blockers.

## Notes

- The new `section-locator-decision` Quick Action derives title, detail, disabled state, and target from the existing Section Locator Cue Decision summary.
- The command routes only through the existing Section Locator cue handler.
- Quick Action result metrics and follow-up copy now cover the new decision command before direct section cue parsing.
- README, product docs, quality rules, and QA expectations now name Section Locator Cue Decision command access explicitly.
