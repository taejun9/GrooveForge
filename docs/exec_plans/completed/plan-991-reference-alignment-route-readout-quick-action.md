# plan-991-reference-alignment-route-readout-quick-action

## Goal

Add a read-only Reference Alignment Route Readout Quick Action so beginners and working producers can see whether the current written-reference fit, direction, arrangement form, mix posture, listen cue, or handoff readiness lane should route to Session Brief, Arrange, Master, Mix, or Deliver before focusing a Reference Alignment card, editing brief fields, cueing playback, exporting, or changing project data.

## Scope

- Add a UI-local Reference Alignment Route Readout Quick Action that focuses the existing Reference Alignment surface without changing Reference Alignment card derivation, focus-card selection, focus result state, Session Brief fields, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Reference Alignment card to the existing direct Reference Alignment card command while retaining selected Pattern A/B/C, current Delivery Target, brief field count, export/stem/package readiness, editable event counts, alignment metric, song length, audition cue, and next reference-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Reference Alignment focus, direct Reference Alignment card commands, Session Brief editing, playback, export, remote analysis, and imported-reference workflows.

## Non-Goals

- Do not change project schema, saved project files, Reference Alignment card derivation, card scoring, focus target selection, focus routing, focus result state, Session Brief editing, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, reference-track uploads, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic focus, automatic brief edits, automatic reference matching, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, or media uploads from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `reference-alignment-route-readout-action` that reviews the current written-reference route, direct Reference Alignment card handoff, destination, brief/export/stem/package posture, audition cue, and next listening/handoff check before focus or edit commands run.
- Routed the action only to the existing Session Brief / Reference Alignment surface, leaving focus state, Session Brief text, playback, export state, project data, undo history, and sampling/imported-audio scope unchanged.
- Updated Command Reference coverage, product docs, quality rules, and harness expectations so Reference Alignment Route Readout stays separate from reference audio import, waveform matching, remote analysis, and direct focus/card commands.

## Decision Log

- 2026-06-27: Selected Reference Alignment Route Readout because written-reference fit, direction, form, mix, listen cue, and handoff readiness are local session-direction lanes, and a route readout helps beginners and producers inspect reference direction before focus, brief edits, cueing, playback, export, or handoff actions.
