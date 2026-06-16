# plan-172-groove-compass-focus Review

## Summary

Groove Compass Focus adds explicit UI-local Focus controls to the existing Density, Anchors, Hat Motion, Timing Feel, Chance, and selected Focus cards. Every Focus control routes to the existing Compose panel, updates the status strip, shows a compact focused readout, and highlights the selected card. It does not change selected drum state, Pattern A/B/C drum data, direct drum editing, playback, render/export, save/load, or sampling scope.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- `npm run qa` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run verify` passed; Vite reported the existing large client chunk warning.
- `git diff --check` passed.
- Browser smoke did not run: localhost dev server escalation was rejected by environment policy. Static source/dist token checks confirmed the Groove Compass Focus strings and selectors are present in source and built assets.

## Findings

- No blocking code findings.
- Focus targets derive from existing Groove Compass card ids.
- Focus state is UI-local and not added to the project schema.
- Focus clicks only scroll to the existing Compose panel and update status text.
- Selected drum state, Pattern A/B/C drum data, direct drum editing, playback, and export paths remain unchanged.

## Residual Risk

- Runtime visual validation could not be completed in Browser because localhost dev server startup was blocked by environment policy.
- The production build still emits the existing Vite large chunk warning; this plan did not change bundling.

## Follow-Ups

- Run a local browser smoke in an environment that allows localhost, checking Focus buttons, card highlight, status text, Compose scroll target, console logs, and horizontal overflow.
