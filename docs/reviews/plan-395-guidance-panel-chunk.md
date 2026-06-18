# plan-395-guidance-panel-chunk Review

## Status

Completed

## Summary

Split the render-only Guided/Studio workflow guidance panels from `src/ui/App.tsx` into `src/ui/workstationGuidancePanels.tsx` and added a Vite/Rolldown `workstation-guidance-panels` code-splitting group. The production build now emits the guidance panel chunk separately and no longer reports the previous large main chunk warning.

## QA

- 2026-06-19: `git diff --check` passed.
- 2026-06-19: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-19: `npm run typecheck` passed.
- 2026-06-19: `npm run build` passed without the previous large-chunk warning; output includes `workstation-guidance-panels-Cty_7jYA.js` at 6.98 kB and `index-DTQXZNAI.js` at 498.61 kB.
- 2026-06-19: `npm run verify` passed without a large-chunk warning.

## Review

- No behavior regression found in the refactor scope.
- Mode Focus, First Beat Path, Session Pass, Workflow Navigator, and Workflow Spotlight keep the same props, data-testid contracts, button labels, focus/jump callbacks, and local-only derivation behavior.
- No project schema, save/load, playback, audio render, WAV/stem/MIDI export, Handoff, Quick Actions execution, local draft, sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync behavior changed.

## Follow-Up

- Continue extracting cohesive render-only panels if future feature work pushes the main `index` chunk back over the warning threshold.
