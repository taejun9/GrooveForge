# plan-833-composer-action-result-route

## Goal

Make Composer Action Result feedback show the local writing route that handled the explicit action after a visible button or direct Quick Action runs.

## Scope

- Add UI-local route context to `ComposerActionResult`.
- Show the route in the visible Composer Action Result strip.
- Derive route context only from the existing Composer Action command and current action area.
- Preserve Composer Actions derivation, command ids, button and command routing, result metrics, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Composer Actions scoring, action derivation, action order, writing handlers, result metric calculations, Quick Actions command ids, or save/load schema.
- No project schema, undo history, playback, export, render, sampler, imported audio, remote AI, accounts, analytics, or cloud sync changes.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

Build note: Vite repeated the existing large chunk warning for the main app bundle.

## Implementation Notes

- Added a UI-local `route` field to `ComposerActionResult`.
- Derived the result route with `quickActionComposerActionRouteLabel(action, action.area)`, matching the existing Composer Action command route context.
- Rendered the route in the Composer Action Result meta strip beside status, scope, impact, and undo posture.
- Updated README, product docs, quality rules, and QA harness expectations for Composer Action result route feedback.

## Decision Log

- Composer Action result route context should be a UI-only result field so clicked writing moves explain which existing local handler path ran without changing project data or command routing.
- QA completed before review and plan completion.
