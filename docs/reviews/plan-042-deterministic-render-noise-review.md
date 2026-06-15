# plan-042-deterministic-render-noise Review

## Summary

Offline render noise is now deterministic. GrooveForge derives a stable seed from render-relevant project data and uses seeded noise samples in the offline WAV/stem/export-meter render path instead of `Math.random()`.

## QA

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test on `http://127.0.0.1:5173/`: export meter stayed identical across Guided/Studio mode changes, playback started/stopped, and console warning/error logs were empty.

## Findings

- No blocking findings.
- `src/audio/render.ts` no longer uses `Math.random()`.
- The seed source excludes transient UI mode, title, and save timestamp data.
- WAV export, stem export, and export meter analysis continue to use the same offline render function.
- Realtime scheduler behavior remains unchanged.
- No sampling, remote AI, imported audio, or hidden audio assets were introduced.

## Residual Risk

- This improves reproducibility but does not add LUFS, true-peak, dithering, or a standards-grade limiter. Current metering remains peak/RMS/headroom with simplified limiter activity.

## Follow-Ups

- Add standards-based loudness/true-peak validation only when the implementation can be verified against official references and fixtures.
