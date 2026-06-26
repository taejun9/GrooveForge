# plan-831-composer-actions-command-detail

## Goal

Make direct Composer Action Quick Actions expose the same writing move, route, scope, impact, undo, audition, and next-check context before the user runs the command.

## Scope

- Add UI-local command detail for each direct Composer Action Quick Action.
- Derive command context only from existing Composer Actions, current local project state, and existing Composer Action follow-up cues.
- Preserve command ids, command routing, Composer Actions result behavior, action ordering, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Composer Actions scoring, action derivation, action order, writing handlers, result labels, or result metrics.
- No project schema, undo history, playback, export, save/load, render, sampler, imported audio, remote AI, accounts, analytics, or cloud sync changes.

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

- Added `composerActionQuickActionDetail(action, project)` as the shared pre-run command detail source for direct Composer Action Quick Actions.
- Kept the first four command detail fields as `label / scope / impact / safety` so existing Quick Actions result metric fallback parsing remains stable.
- Added route, action detail, audition cue, and next composer-action check context to command details and search keywords.
- Updated README, product docs, quality rules, and QA harness expectations for Composer Action command detail context.

## Decision Log

- Composer Action command detail should remain pre-run and informational: it tells the user what route/scope/impact/undo posture/audition/next check apply, but it must not add confirmations, chains, autoplay, or export triggers.
- QA completed before review and plan completion.
