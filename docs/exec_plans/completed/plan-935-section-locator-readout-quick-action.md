# plan-935-section-locator-readout-quick-action

## Goal

Expose Section Locator as a dedicated read-only Quick Action so beginners and working producers can inspect the current Intro/Verse/Hook/Bridge/Outro cue recommendation, target block, Pattern A/B/C assignment, bar range, editable event count, and next audition check before explicitly cueing a section.

## Scope

- Add a UI-local Section Locator Readout Quick Action that focuses the existing Arrange panel without selecting a block or changing Block loop scope.
- Add result metrics/follow-up copy for the current section cue recommendation, target section, target block scope, Pattern A/B/C assignment, bar range, selected Pattern, editable event count, song block count, total bar count, audition cue, and next manual section check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Section Locator readout coverage is distinct from the cueing Section Locator decision/direct commands.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Section Locator cueing, Arrangement Block Cue, Arrangement Move, Arrangement Focus, Arrangement Arc, Arrangement Template, Chain Expand, Pattern Chain, selected-block edits, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `section-locator-readout-action` Quick Action that focuses the existing Arrange panel and reports the current section cue recommendation without selecting a block or changing Block loop scope.
- Added Section Locator Readout result metrics and follow-up guidance covering target section, target block scope, Pattern A/B/C assignment, bar range, selected Pattern, editable event count, song block count, total bar count, audition cue, and next manual section check.
- Split Command Reference and product/quality language so Section Locator Readout is treated as `Quick Actions / Readout`, while Section Locator remains the explicit `Quick Actions / Cue` route.

## Decision Log

- 2026-06-27: Selected Section Locator Readout because Section Locator is currently documented as readout while its Quick Actions cue selected-block and Block-loop state; separating readout and cue keeps arrangement inspection non-mutating.
- 2026-06-27: Kept the readout action on the existing Arrange panel focus/readout path so sampling remains optional and the core workflow stays direct beat composition first.
