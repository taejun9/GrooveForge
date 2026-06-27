# plan-988-composer-guide-route-readout-quick-action

## Goal

Add a read-only Composer Guide Route Readout Quick Action so beginners and working producers can see whether the current drums, 808/bass, harmony, melody, arrangement, or finish writing lane should route to Compose, Arrange, Mix, Master, or Deliver before focusing a guide card, editing notes, exporting, or changing project data.

## Scope

- Add a UI-local Composer Guide Route Readout Quick Action that focuses the existing Composer Guide surface without changing Composer Guide card derivation, focus-card selection, focus result state, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Composer Guide card to the existing direct Composer Guide card command while retaining selected Pattern A/B/C, editable event counts, current mode, guide metric, song length, audition cue, and next writing-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Composer Guide focus, direct Composer Guide card commands, playback, export, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Composer Guide card derivation, card scoring, focus target selection, focus routing, focus result state, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic focus, automatic fixes, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, or media uploads from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a UI-local Composer Guide Route Readout Quick Action that scrolls to the existing Composer Guide panel and reports the current writing route, selected Pattern, card status, direct `composer-guide-card-*` handoff, and destination panel without changing Composer Guide focus state, playback, exports, undo history, project data, or sampling scope.
- Extended Quick Actions result metrics and follow-up copy so route readout stays distinct from Composer Guide focus and direct Composer Guide card commands while still exposing route, guide metric, audition cue, next writing-route check, current mode, editable event count, and song length.
- Updated Command Reference, product docs, quality rules, and harness checks so GrooveForge remains framed as an all-genre direct beat workstation with sampling as secondary scope.

## Decision Log

- 2026-06-27: Selected Composer Guide Route Readout because Composer Guide is a direct-composition lane for drums, 808/bass, harmony, melody, arrangement, and finish work, and a route readout helps beginners and producers inspect the current writing destination before focus, edit, playback, or export actions.
