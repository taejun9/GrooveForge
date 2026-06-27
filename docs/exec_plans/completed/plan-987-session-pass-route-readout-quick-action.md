# plan-987-session-pass-route-readout-quick-action

## Goal

Add a read-only Session Pass Route Readout Quick Action so beginners and working producers can see whether the current guided, studio, finish, or delivery pass should route to Transport, Compose, Arrange, Mix, Master, or Deliver before focusing a pass card, editing notes, exporting, or changing project data.

## Scope

- Add a UI-local Session Pass Route Readout Quick Action that focuses the existing Session Pass surface without changing Session Pass card derivation, active-card selection, focus result state, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Session Pass card to the existing direct Session Pass card command while retaining selected Pattern A/B/C, editable event counts, current mode, session posture, song length, audition cue, and next session-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Session Pass focus, direct Session Pass card commands, playback, export, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Session Pass card derivation, card scoring, active-card selection, focus routing, focus result state, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
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

- Added a UI-local `session-pass-route-readout-action` Quick Action that scrolls to the Session Pass surface, reports the current Guided/Studio/Finish/Delivery route, selected Pattern, direct `session-pass-card-*` handoff, and destination panel without changing Session Pass focus result state, playback, export, project data, undo history, or sampling scope.
- Added Session Pass route labeling/result metric/follow-up coverage and Command Reference context so route readout remains distinct from Session Pass focus and direct card focus commands.
- Updated README, product rules, quality rules, and harness checks to keep GrooveForge direct-composition-first with sampling only as secondary scope.

## Decision Log

- 2026-06-27: Selected Session Pass Route Readout because it helps users inspect the current Guided, Studio, Finish, or Delivery route before focus, playback, edit, or export actions, while keeping GrooveForge direct-composition-first and sampling secondary.
