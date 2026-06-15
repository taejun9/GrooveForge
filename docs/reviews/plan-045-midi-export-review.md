# plan-045-midi-export Review

## Summary

Arrangement MIDI export is implemented as deterministic Standard MIDI File generation from GrooveForge project events. The export includes tempo, drum, 808, synth, and chord tracks, follows arrangement Pattern A/B/C assignments, block lengths, track mutes, energy, note/chord lengths, drum repeats, event chance gates, and chord inversions, and does not introduce sampling, imported audio, remote AI, or hidden assets.

## QA

- `npm run typecheck`: passed.
- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.
- Browser smoke: `MIDI` button is unique, click changes status to `Exported MIDI`, playback starts and stops, and console errors are empty. Codex in-app Browser does not support download capture, so the `.mid` download event could not be saved from that browser surface.

## Findings

No blocking findings.

## Residual Risk

The in-app browser cannot capture the generated `.mid` artifact even though the UI export path runs and reports success. A future automated browser or desktop harness with download support should assert the downloaded filename and parse the generated MIDI bytes directly.

## Follow-Ups

- Add a MIDI parser or byte-level harness check when the test stack gains a lightweight unit-test runner.
- Consider a later MIDI input or piano-roll refinement plan only after export, arrangement, and editing workflows remain stable.
