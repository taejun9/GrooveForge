# plan-850-mode-switch-command-context

## Goal

Make direct Mode Switch Quick Action command details expose the same switch destination, current/target mode, audition cue, and next-check posture already carried by visible Guided/Studio mode buttons.

## Scope

- Add command detail context for `mode-switch-guided` and `mode-switch-studio`.
- Keep mode switching explicit, local, and routed through the existing mode switch handler.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve project mode save/load semantics, Mode Focus, Session Pass, First Beat Path, command ids, Quick Actions filtering, result strips, project data, playback, export, and sampler scope.

## Non-Goals

- No automatic mode switching, command chains, tutorials, onboarding overlays, dynamic remote recommendations, playback starts, project data mutation beyond explicit mode switch, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Added an explicit `Target` segment to the shared Mode Switch context helper used by visible Guided/Studio buttons and direct Mode Switch Quick Actions.
- Updated README, product docs, quality rules, and QA expectations so Mode Switch command details keep switch destination, current mode, explicit target mode, mode transition, local context, audition cue, and next check visible before execution.

## Decision Log

- Direct Mode Switch commands should provide the same pre-run posture as visible top-bar mode buttons so beginners understand the workflow jump and producers can switch modes deliberately from command search.
- Preserve the shared helper rather than adding a separate command-only detail path, so visible buttons and command-palette actions cannot drift apart.
