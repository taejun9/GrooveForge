# plan-894-create-editing-reference-context

## Goal

Expose direct editing and audible-pattern command context in Create Command Reference rows so beginners and working producers can discover drum, bass, melody, chord, selected-event, and heard-pattern checks before opening Quick Actions.

## Scope

- Add static Command Reference row context for Drum Move, 808 Move, Melody Move, Chord Move, Selected Event Tools, Pattern Playback Readout, and Audible Pattern Follow.
- Keep the focus on editable musical events, direct composition, and explicit audition/follow checks.
- Update README, product, quality rules, and QA expectations to lock the new row context.

## Non-Goals

- Do not change command execution, Quick Actions behavior, selected-event editing, Pattern A/B/C data, playback, arrangement data, render/export, save/load, or sampling scope.
- Do not add tutorials, command chains, auto-writing, auto-follow mode, hidden selection changes, remote AI, accounts, analytics, cloud sync, or sampler behavior.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

Notes:

- `npm run verify` confirmed runtime smoke for 14/14 sample-free Beat Blueprints and 14/14 supported style profiles.
- `npm run build` still reports the existing Vite large chunk warning for the main app chunk; build exits successfully.

## Decision Log

- 2026-06-26: Selected the remaining direct editing and audible Pattern rows because they are the next Create references after pattern-building context and are central to professional-speed editing plus beginner-friendly listening checks.
