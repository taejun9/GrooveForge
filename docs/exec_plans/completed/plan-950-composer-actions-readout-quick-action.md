# plan-950-composer-actions-readout-quick-action

## Goal

Expose Composer Actions as a dedicated read-only Quick Action so beginners and working producers can inspect the current style-aware writing move, route, scope, impact, undo posture, selected Pattern A/B/C event posture, arrangement usage, export readiness, audition cue, and next composer-action check before explicitly running any writing action.

## Scope

- Add a UI-local Composer Actions Readout Quick Action that focuses existing Compose/Pattern context without running Composer Actions, changing selected Pattern, selected arrangement block, loop scope, playback, arrangement state, mixer/master state, export state, or project data.
- Add result metrics and follow-up copy for current priority writing action, writing area, route, scope, impact, undo posture, selected Pattern A/B/C, event counts, arrangement usage, export readiness, audition cue, and next manual Composer Actions check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Composer Actions Readout is distinct from direct Composer Action commands that mutate project data.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Composer Actions, Layer Starter, Pattern Stack, Pattern Variation, Pattern Fill, Pattern Clone, Pattern Copy, Pattern Clear, Pattern Chain, arrangement templates, Master Finish, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, mixer/master edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added `composer-actions-readout-action` before direct Composer Action commands so command-palette users can review the current style-aware writing move without running a writing handler.
- Added UI-local focus/status routing plus Composer Actions Readout result metrics and follow-up copy covering route, scope, impact, undo posture, selected Pattern, event counts, Pattern A/B/C use, arrangement use, export readiness, audition cue, and next check.
- Updated product docs, quality rules, Command Reference coverage, and harness expectations to keep the project framed as direct beat composition first, with sampling scope unchanged.

## Decision Log

- 2026-06-27: Selected Composer Actions Readout because direct Composer Action commands intentionally mutate local writing state through drums, 808, harmony, melody, arrangement, or finish handlers, while command search should also provide a read-only pre-flight posture for users who only want to inspect the current writing recommendation before editing.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not run writing actions, change selected Pattern, change loop scope, start playback, alter arrangement, export, or touch sampling scope.
