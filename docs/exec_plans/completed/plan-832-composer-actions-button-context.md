# plan-832-composer-actions-button-context

## Goal

Make visible Composer Action buttons expose the same direct-writing route, scope, impact, undo, audition, and next-check context as Composer Action Quick Actions before the user clicks a writing move.

## Scope

- Add UI-local title and aria-label context to visible Composer Action buttons.
- Derive button context only from existing Composer Actions, current local project state, and existing Composer Action follow-up cues.
- Preserve Composer Action command ids, command routing, button click routing, action ordering, result strips, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Composer Actions scoring, action derivation, action order, writing handlers, result labels, result metrics, or Quick Actions command ids.
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

- Added `composerActionButtonContext(action, project)` so visible Composer Action buttons share the same pre-run context source as direct Composer Action Quick Actions.
- Passed current project state into `ComposerActions` only for UI-local button title and aria-label context derivation.
- Updated visible Composer Action buttons to expose writing route, scope, impact, undo posture, audition cue, and next check through `title` and `aria-label`.
- Updated README, product docs, quality rules, and QA harness expectations for visible Composer Action button context.

## Decision Log

- Visible Composer Action buttons should share the same pre-run context source as direct Composer Action Quick Actions so button users and command-palette users see consistent writing-move consequences before running a local edit.
- QA completed before review and plan completion.
