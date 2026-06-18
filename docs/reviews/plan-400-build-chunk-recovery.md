# Plan 400 Build Chunk Recovery Review

## Summary

Plan 400 removes the recurring Vite large-chunk warning through real code separation. Snapshot Compare read-only derivation now lives in `src/ui/workstationSnapshotCompare.ts`, and shared pure analysis helpers live in `src/ui/workstationAnalysis.ts`; Vite emits both as dedicated chunks.

## QA

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with no large-chunk warning.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 11/11 Beat Blueprints and 11/11 supported style profiles.

Production build evidence: `workstation-snapshot-compare` is 3.31 kB, `workstation-analysis` is 0.50 kB, and the main entry is 499.97 kB after minification.

## Findings

- No blocking findings. `chunkSizeWarningLimit` was not added or raised.
- The extracted code is pure derivation/helper code and keeps existing handlers, focus routing, project profile calculation, save/load, playback, render/export, Handoff, local draft, and Quick Actions behavior intact.
- The change does not add sampling, imported audio, remote AI, accounts, analytics, payments, or cloud sync.

## Residual Risk

- Browser visual QA was not run because this build-hygiene change is behavior-preserving and local browser control has been unavailable in this environment; build/type/static/runtime coverage passed.

## Follow-Ups

- Keep monitoring entry chunk size as new workstation features are added.
