# plan-203-concept-sampling-audit

## Status

Completed.

## Goal

Audit the current GrooveForge product brief against the user's corrected concept: GrooveForge is an all-genre beat-production mini DAW for direct beat composition, sound design, arrangement, mixing/mastering, and export. Sampling must remain an optional accessory module, not the product identity, MVP proof, first-run path, default instrument panel, or core data model.

## Non-Goals

- Do not implement sampling, sampler tracks, audio import, waveform editing, or sample-pack workflows.
- Do not change app runtime behavior, project schema, playback, rendering, export, or UI layout.
- Do not soften the existing beat-first/all-genre product direction.

## Scope Completed

- Strengthened README/product wording so draft references to sampler setup or a sampler default panel item are explicitly optional sampling-phase work.
- Added product and architecture rules that the default instrument/device palette is built-in drum rack, synth 808/bass, simple synth, chord synth, FX, mixer, and master devices.
- Added product guidance that external `AudioClipEvent` examples must be rewritten as optional extension examples instead of copied into the core `MusicalEvent` union.
- Added quality and harness expectations so future draft drift is caught by static QA.

## QA

| Command | Result |
|---|---|
| `python3 harness/scripts/run_qa.py` | Pass |
| `python3 harness/scripts/run_quality_gate.py` | Pass |
| `git diff --check` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass with existing Vite chunk-size warning |
| `npm run qa` | Pass |
| `npm run verify` | Pass with existing Vite chunk-size warning |

## Review

No findings. The change is documentation and harness-only. It reinforces the all-genre direct beat workstation framing, keeps sampling structurally subordinate, and does not change app runtime behavior, project data, playback, rendering, export, or UI.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Treat this as a documentation and harness guardrail task. | The repository already contains the concept reframe; the remaining risk is future draft drift from sampler/audio-clip examples. |
| 2026-06-17 | Explicitly reject sampler as a default instrument-panel item. | The attached brief's example panel could otherwise make sampling look co-equal with built-in instruments. |
