# plan-1001-pattern-switchup-variation

## Goal

Add a direct-composition Pattern Switchup variation preset so beginners can create a clear section change with one click and working producers can quickly generate a denser transition Pattern without sampling, imported audio, remote AI, or command chains.

## Scope

- Add a new deterministic Pattern Variation preset that mutates only editable Pattern A/B/C musical events: drum velocities/timing/probability, hat repeats, 808/bass, chords, and synth melody posture.
- Expose the preset through existing Pattern Variation buttons, previews, results, Quick Actions, Command Reference coverage, README/product docs, and QA expectations.
- Preserve existing Pattern Variation routing, undo history, selected Pattern behavior, playback, save/load, WAV/stem/MIDI export, Handoff behavior, privacy boundaries, and sampling boundaries.

## Non-Goals

- Do not add sample import, sample chopping, audio clips, sampler tracks, remote AI generation, automatic arrangement, autoplay, auto-export, hidden command chains, cloud sync, accounts, analytics, plugin hosting, or project schema changes.
- Do not replace existing Subtle, Hook, or Breakdown presets.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added an explicit Switchup Pattern Variation preset routed through the existing deterministic Pattern Variation path.
- Exposed Switchup through Pattern Variation previews, results, Quick Actions, Command Reference text, README/product docs, and QA expectations.
- Preserved local-first, sample-free composition scope; no imported audio, sampler, remote AI, project schema, playback, or export behavior changes.

## Decision Log

- 2026-06-27: Selected a Pattern Switchup preset because it improves the direct beat-composition core by making section contrast faster without moving optional sampling into the MVP path.
