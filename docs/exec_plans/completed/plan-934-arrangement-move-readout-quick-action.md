# plan-934-arrangement-move-readout-quick-action

## Goal

Expose Arrangement Move as a dedicated read-only Quick Action so beginners and working producers can inspect the current selected-block Drop/Build/Hook Lift suggestion, section role, energy, muted-track posture, and next audition check before explicitly applying an Arrangement Move.

## Scope

- Add a UI-local Arrangement Move Readout Quick Action that focuses the existing Arrange panel without running `applyArrangementMoveToSelected`.
- Add result metrics/follow-up copy for the current selected-block move recommendation, block scope, section, Pattern A/B/C assignment, bar length, energy, mute posture, selected Pattern, editable event count, song block count, total bar count, audition cue, and next manual move check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Arrangement Move readout coverage is distinct from the mutating Arrangement Move decision/direct commands.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Arrangement Move, Arrangement Focus, Arrangement Arc, Arrangement Template, Chain Expand, Pattern Chain, selected-block edits, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `arrangement-move-readout-action` Quick Action that focuses the Arrange panel and reports the current selected-block Arrangement Move suggestion without invoking `applyArrangementMoveToSelected`.
- Added Arrangement Move Readout result metrics and follow-up guidance covering preset, block scope, section, Pattern assignment, bar length, energy, mute posture, selected Pattern, editable event count, arrangement length, audition cue, and next manual move check.
- Split Command Reference and product/quality language so Arrangement Move Readout is treated as `Quick Actions / Readout`, while Arrangement Move decision/current commands remain the explicit mutating apply routes.

## Decision Log

- 2026-06-27: Selected Arrangement Move Readout because Arrangement Move currently mixes preview/readout language with mutating Drop/Build/Hook Lift apply commands; separating readout and decision keeps arrangement inspection non-mutating.
- 2026-06-27: Kept Arrangement Move Readout focused on selected-block energy/mute posture rather than changing Pattern A/B/C events, preserving the direct beat workstation flow and sampler-secondary invariant.
