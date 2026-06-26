# plan-933-arrangement-focus-readout-quick-action

## Goal

Expose Arrangement Focus as a dedicated read-only Quick Action so beginners and working producers can inspect the current selected-block focus suggestion, section/pattern/bar posture, energy, muted-track posture, and next audition check before explicitly applying a focus preset.

## Scope

- Add a UI-local Arrangement Focus Readout Quick Action that focuses the existing Arrange panel without running `applyArrangementFocus`.
- Add result metrics/follow-up copy for the current selected-block focus recommendation, block scope, section, Pattern A/B/C assignment, bar length, energy, mute posture, selected Pattern, editable event count, song block count, total bar count, audition cue, and next manual focus check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Arrangement Focus readout coverage is distinct from the mutating Arrangement Focus decision/direct commands.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Arrangement Focus, Arrangement Move, Arrangement Arc, Arrangement Template, Chain Expand, Pattern Chain, selected-block edits, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `arrangement-focus-readout-action` Quick Action that focuses the Arrange panel and reports the current selected-block Arrangement Focus suggestion without invoking `applyArrangementFocus`.
- Added Arrangement Focus Readout result metrics and follow-up guidance covering preset, block scope, section, Pattern assignment, bar length, energy, mute posture, selected Pattern, editable event count, arrangement length, audition cue, and next manual focus check.
- Split Command Reference and product/quality language so Arrangement Focus Readout is treated as `Quick Actions / Readout`, while Arrangement Focus decision/direct commands remain the explicit mutating apply routes.

## Decision Log

- 2026-06-27: Selected Arrangement Focus Readout because existing Command Reference wording treats Arrangement Focus as readout while the Quick Action path applies selected-block section/pattern/bar/energy/mute focus presets; separating readout and decision keeps direct beat arrangement inspection non-mutating.
- 2026-06-27: Updated harness expectations after the first QA pass showed remaining legacy Arrangement Focus Decision-only strings in long product and quality coverage checks.
