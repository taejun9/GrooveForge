# plan-011-mixer-master-controls

## Goal

Make the mixer and master controls more real by connecting pan, solo, master output gain, and master preset ceiling choices to playback/export behavior.

## Context

The project model already stored `volumeDb`, `pan`, `muted`, `solo`, master ceiling, and master preset data. Before this plan, only volume/mute and ceiling-like output gain were meaningfully reflected in realtime playback/export. Working producers need basic mix decisions to affect sound, and beginners need master presets to make visible changes instead of acting as labels.

## Scope

- Added reusable master preset metadata and ceiling mappings.
- Added mixer UI controls for solo and precise pan.
- Applied mute/solo/volume/pan in realtime playback.
- Applied mute/solo/volume/pan and master output gain in WAV export.
- Made master preset buttons update both `masterPreset` and `masterCeilingDb`.
- Updated docs and QA expectations for mixer/master behavior.

## Out Of Scope

- No EQ, compressor, saturation, limiter DSP, LUFS meter, or true peak meter implementation.
- No sidechain or send effects.
- No automated audio-analysis test for pan/solo output yet.

## Validation

- `python3 harness/scripts/run_qa.py`
  - Passed.
- `npm run typecheck`
  - Passed.
- `npm run verify`
  - Passed.
- `git diff --check`
  - Passed.
- Browser check against `http://127.0.0.1:5173/`
  - Passed. Changed Synth pan to 55 with the numeric pan input, soloed Synth, selected Streaming Safe, verified the master readout changed to `-1 dB ceiling`, verified the session meter showed `1 active channel`, started playback, stopped playback, and observed no browser console errors.

## Checklist

- [x] Add master preset constants and helpers.
- [x] Implement pan/solo in realtime and export paths.
- [x] Add mixer UI controls for solo and pan.
- [x] Link master preset buttons to ceiling values.
- [x] Update docs and QA expectations.
- [x] Run QA/build/browser verification.
- [x] Move plan to completed and create review mirror.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Implement core pan/solo before advanced effects. | Volume, pan, mute, solo, and master output are the minimum useful mixer behavior for both beginners and working beatmakers. |
| 2026-06-15 | Treat master presets as target ceiling shortcuts, not full mastering chains. | The product docs explicitly separate mixing/mastering and avoid claiming automatic mastering quality before meters and DSP are implemented. |
| 2026-06-15 | Add a numeric pan input next to the pan slider. | It gives producers precise values and gives the Browser verification a reliable control to assert. |

## Activity Log

| Date | Role | Note |
|---|---|---|
| 2026-06-15 | project_lead | Chose mixer/master behavior as the next concrete step toward a useful desktop beat workstation. |
| 2026-06-15 | harness_builder | Added master preset constants, mixer pan/solo UI, realtime/export mix rules, and QA expectations. |
| 2026-06-15 | quality_runner | Ran QA, typecheck, verify, diff check, and Browser validation successfully. |
| 2026-06-15 | review_judge | Documented residual mixer/master risks and follow-ups. |
