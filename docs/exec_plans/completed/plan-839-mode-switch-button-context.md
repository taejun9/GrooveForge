# plan-839-mode-switch-button-context

## Goal

Make visible Guided/Studio Mode Switch buttons and direct Mode Switch Quick Actions expose switch destination, current mode, audition cue, and next-check context before a beginner or producer changes workflow mode.

## Scope

- Add shared mode-switch context for the visible Guided and Studio mode buttons.
- Add matching command detail context for direct `mode-switch-guided` and `mode-switch-studio` Quick Actions.
- Derive context from existing mode labels, Mode Focus, Session Pass, First Beat Path, and local project posture.
- Preserve mode switching behavior, Mode Focus, Session Pass, First Beat Path, command ids, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to mode persistence semantics, Mode Focus scoring, Session Pass scoring, First Beat Path scoring, command execution semantics, saved project schema, undo history, playback, export, sampler, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: Vite reported the existing large chunk warning during build and verify.

## Implementation Notes

- Added `createModeSwitchButtonContext` so visible Guided/Studio mode buttons and direct Mode Switch Quick Actions share switch destination, current mode, target mode, context, audition cue, and next-check text.
- Added matching `title` and `aria-label` context to the visible Guided and Studio top buttons without changing their labels, selected styling, or shared switch handler.
- Updated README, product principles, quality rules, and QA harness expectations to keep Mode Switch context aligned with local-first, sample-secondary direct beat-making scope.

## Decision Log

- Mode switching should feel like an explicit workflow-context choice, not an unlabelled UI toggle or a sampling workflow shortcut.
