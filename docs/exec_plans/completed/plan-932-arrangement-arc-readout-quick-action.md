# plan-932-arrangement-arc-readout-quick-action

## Goal

Expose Arrangement Arc as a dedicated read-only Quick Action so beginners and working producers can inspect the current full-song energy arc, section flow, Pattern A/B/C spread, mute posture, and next audition check before explicitly applying an arc pad.

## Scope

- Add a UI-local Arrangement Arc Readout Quick Action that focuses the existing Arrange panel without running `applyArrangementArc`.
- Add result metrics/follow-up copy for the current arc recommendation, section flow, Pattern A/B/C spread, average energy, energy range, muted-track posture, block count, bar count, selected Pattern, editable event count, audition cue, and next manual arc check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Arrangement Arc readout coverage is distinct from the mutating Arrangement Arc decision/direct commands.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Arrangement Arc, Arrangement Template, Chain Expand, Pattern Chain, arrangement moves, arrangement focus presets, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a non-mutating `arrangement-arc-readout-action` Quick Action that focuses Arrange, reports the current suggested full-song energy arc, and does not call the Arrangement Arc apply path.
- Split Command Reference and docs coverage so Arrangement Arc Readout is `Quick Actions / Readout` while Arrangement Arc remains `Quick Actions / Decision`.
- Extended QA harness checks for source, docs, command-map coverage, focus-only routing, and readout result metrics.

## Decision Log

- 2026-06-27: Selected Arrangement Arc Readout because existing Command Reference wording treated Arrangement Arc as readout while the Quick Action path applies full-song energy arcs; separating readout and decision keeps direct beat arrangement inspection non-mutating.
