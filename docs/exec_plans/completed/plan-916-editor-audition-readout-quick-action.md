# plan-916-editor-audition-readout-quick-action

## Goal

Expose Editor Audition posture as a read-only Quick Actions status command so beginners and working producers can confirm the currently selected drum, 808, Synth, or Chord event, selected Pattern context, one-shot audition route, runtime fallback posture, event metric, arrangement context, and next listening check before auditioning, editing, arranging, or exporting.

## Scope

- Add a read-only `editor-audition-readout-action` Quick Action that reports the current selected-event audition target, selected Pattern, selected arrangement block, event type, event metric, one-shot route, runtime fallback posture, Pattern A/B/C usage, editable event counts, arrangement length, and export readiness without starting audio, auditioning an event, changing selection, mutating notes/drums/chords, changing playback, or changing export output.
- Add deterministic Quick Action result metric and follow-up copy derived only from selected-event state, local project state, arrangement context, export readiness, and current Editor Audition result posture.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, audition/project-data, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Editor Audition one-shot synthesis, runtime audio startup behavior, selected-event routing, selected-event state, audition result derivation, drum/note/chord editing, copy/paste, playback scheduling, Pattern data, arrangement data, save/load, project schema, MIDI export, Handoff output, or render/export output.
- Do not add autoplay loops, recording, audio input, sampler devices, imported audio, remote AI, accounts, analytics, cloud sync, macros, command chains, automatic note generation, or auto-export.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: `npm run build` and `npm run verify` reported the existing Vite chunk-size warning for the main bundle after minification.

## Completion Notes

- Added `editor-audition-readout-action`, a read-only focus handler, a selected-event readout summary, a result metric snapshot, and follow-up copy for checking selected drum/808/Synth/chord audition posture before any one-shot audition runs.
- Updated Command Reference context, README, product rules, quality rules, and QA harness expectations so Editor Audition readout is discoverable without starting audio, auditioning an event, changing selection, mutating notes/drums/chords, changing playback, changing export output, or expanding sampling scope.

## Decision Log

- 2026-06-27: Selected Editor Audition Readout because the Create input Command Reference already marks Editor Audition as readout-capable, but Quick Actions needs a non-playing status command for checking the selected event and one-shot audition route before any audible audition command runs.
