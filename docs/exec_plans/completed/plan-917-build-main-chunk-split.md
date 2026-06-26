# plan-917-build-main-chunk-split

## Goal

Remove the remaining production main-bundle large-chunk warning through real Vite/Rolldown chunk separation so GrooveForge keeps professional build hygiene while preserving the direct beat workstation behavior for beginners and working producers.

## Scope

- Split large pure helper/readout and quick-action result/metric areas out of `src/ui/App.tsx` into dedicated UI helper modules that can be assigned to Vite/Rolldown output chunks.
- Update `vite.config.ts` code-splitting groups and project docs/QA expectations so production builds verify the dedicated chunk and no longer accept the main bundle warning as expected output.
- Preserve `outDir: "dist"`, `sourcemap: true`, and real `build.rolldownOptions.output.codeSplitting.groups`; do not set or raise `chunkSizeWarningLimit`.

## Non-Goals

- Do not change app UI behavior, project schema, playback, Web Audio scheduling, MIDI behavior, WAV/stem/MIDI export, Handoff behavior, local draft behavior, Command Reference semantics, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not hide build warnings by suppressing Vite output.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Moved extracted UI helper/readout code from `src/ui/App.tsx` into `src/ui/workstationAppHelpers.tsx`.
- Moved quick-action result/metric generation into `src/ui/workstationAppQuickActions.tsx`.
- Moved read-only derivation helpers into `src/ui/workstationAppDerivations.tsx`.
- Added `workstation-app-helpers`, `workstation-app-quick-actions`, and `workstation-app-derivations` Vite/Rolldown code-splitting groups and documented them in README, harness architecture, quality rules, and QA expectations.
- Verified `npm run build` no longer emits the Vite large-chunk warning. The largest JS chunks are `workstation-app-helpers` at 449.16 kB and `workstation-app-quick-actions` at 320.20 kB.

## Decision Log

- 2026-06-27: Selected build main chunk split because the app already documents that production build hygiene should remove large-chunk warnings through real chunk separation, and the latest verified builds still report a main bundle over 500 kB after minification.
- 2026-06-27: Kept `chunkSizeWarningLimit` unset and split real source modules instead. A helper-only split left a 765 kB helper chunk, so the quick-action result/metric code was split again to bring all JS chunks under the 500 kB warning threshold.
