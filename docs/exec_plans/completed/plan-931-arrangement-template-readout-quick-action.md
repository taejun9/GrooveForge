# plan-931-arrangement-template-readout-quick-action

## Goal

Expose Arrangement Template as a dedicated read-only Quick Action so beginners and working producers can inspect the current suggested song-form template, section flow, Pattern A/B/C spread, arrangement length, and next audition check before explicitly applying a template.

## Scope

- Add a UI-local Arrangement Template Readout Quick Action that focuses the existing Arrange panel without running `applyArrangementTemplate`.
- Add result metrics/follow-up copy for the current template recommendation, section flow, Pattern A/B/C spread, block count, hook count, bar count, selected Pattern, editable event count, audition cue, and next manual template check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Arrangement Template readout coverage is distinct from the mutating Arrangement Template decision/direct commands.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Arrangement Template, Chain Expand, Pattern Chain, arrangement moves, arrangement arcs, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `Arrangement Template Readout` Quick Action that focuses the existing Arrange panel and reports the suggested song-form template without running `applyArrangementTemplate`.
- Split Command Reference/docs coverage so `Arrangement Template Readout` is the status path and `Arrangement Template` remains the explicit decision/apply path.
- Updated the QA harness to cover the new readout command, result metric, follow-up copy, Command Reference row, and non-mutating quality rules.

## Decision Log

- 2026-06-27: Selected Arrangement Template Readout because existing Command Reference wording treated Arrangement Template as readout while the Quick Action path applies templates; separating readout and decision keeps direct beat arrangement inspection non-mutating.
