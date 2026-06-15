# plan-011-mixer-master-controls Review

## Summary

Mixer controls now affect sound instead of being mostly metadata. Volume, mute, solo, pan, master output gain, and master preset ceiling are reflected in realtime playback and WAV export. The UI now exposes solo buttons, pan sliders, numeric pan inputs, and preset buttons that update ceiling values.

## QA

- `python3 harness/scripts/run_qa.py`: passed.
- `npm run typecheck`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.
- Browser check at `http://127.0.0.1:5173/`: passed. Synth pan changed to 55, Synth solo activated, Streaming Safe set the master readout to `-1 dB ceiling`, playback started, and no browser console errors were reported.

## Findings

- No blocking findings.
- `Headroom for Vocal` now starts at `-3 dB ceiling`, matching the preset's purpose.
- Solo logic ignores the master strip as a solo source, so soloing an instrument mutes the other instrument tracks without requiring users to solo master too.

## Residual Risk

- There is still no EQ, compressor, saturation, real limiter DSP, LUFS meter, or true peak meter.
- Pan/solo behavior is covered by UI and build validation, but not by an automated audio-buffer assertion.
- The chord and FX return tracks still do not have their own audible event generators.

## Follow-Ups

- Add render-level tests that assert solo and pan change output buffers.
- Add basic EQ/saturation/compressor controls after the mixer core remains stable.
- Add peak/LUFS metering before describing presets as mastering guidance beyond ceiling targets.
