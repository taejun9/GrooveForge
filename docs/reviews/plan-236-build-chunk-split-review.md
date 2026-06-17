# plan-236-build-chunk-split Review

## Summary

Production build chunk splitting is complete. `vite.config.ts` now preserves `outDir: "dist"` and `sourcemap: true`, then uses Vite 8 / Rolldown `build.rolldownOptions.output.codeSplitting.groups` for React, lucide icons, remaining vendor modules, audio engine code, and workstation core paths.

Docs and static QA now require real chunk splitting and reject `chunkSizeWarningLimit` in `vite.config.ts`.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed and did not emit the large chunk warning.
- `npm run verify` passed and its production build did not emit the large chunk warning.

## Findings

No findings.

## Review Notes

- The implementation uses supported local Vite/Rolldown code splitting instead of hiding the warning.
- The build output keeps sourcemaps and `dist` output.
- The final `npm run build` output emitted `icons-vendor`, `audio-engine`, `react-vendor`, and app entry chunks, with the app entry under the large chunk warning threshold.
- The change does not touch app UI behavior, project schema, playback, audio rendering, WAV/stem/MIDI export, Handoff behavior, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Residual Risk

Low. `workstation-core` is defined as a group for eligible domain modules, but no separate `workstation-core` asset was emitted in the reviewed build output. The warning was removed by the emitted vendor and audio-engine splits without changing runtime behavior.
