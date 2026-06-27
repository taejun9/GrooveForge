# plan-1002-pattern-contrast-readout

## Goal

Add a read-only Pattern Contrast readout so beginners can see whether Pattern A/B/C are meaningfully different and working producers can quickly choose which loop should become the anchor, lift, break, or switchup without sampling, imported audio, remote AI, or hidden generation.

## Scope

- Derive Pattern A/B/C contrast from existing editable musical events: drum hits, 808/bass notes, chord events, synth melody notes, event totals, and arrangement usage.
- Expose the contrast readout through the existing Pattern/Command Reference and Quick Actions surfaces.
- Add local result metrics, audition cue, next check, README/product docs, quality rules, and harness expectations.
- Preserve Pattern Compare, Pattern DNA, Pattern Variation, Pattern Fill, copy/clear, arrangement assignment, undo/redo, playback, save/load, WAV/stem/MIDI export, Handoff behavior, privacy boundaries, and sampling boundaries.

## Non-Goals

- Do not mutate Pattern A/B/C data, auto-generate variations, auto-arrange sections, start playback, export files, add sample import, add sampler tracks, call remote AI, add accounts, analytics, cloud sync, or change project schema.
- Do not replace existing Pattern Compare cue/use decisions or Pattern DNA cards.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Pattern Contrast summary derived from local Pattern A/B/C event counts, drum/music spread, and arrangement usage.
- Exposed Pattern Contrast in the Compose pattern surface, Quick Actions, Command Reference, result metrics, README/product docs, quality rules, and harness expectations.
- Preserved sample-free direct composition scope; no Pattern mutation, auto-generation, playback, export, project schema, remote AI, or sampler changes.

## Decision Log

- 2026-06-27: Selected a Pattern Contrast readout because it improves the direct beat-composition workflow for both beginners and producers while keeping sampling as an optional future extension.
