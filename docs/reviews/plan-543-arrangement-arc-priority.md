# plan-543-arrangement-arc-priority Review

## Summary

Added a read-only, UI-local Arrangement Arc Priority Readout that derives the current full-song energy arc priority from the existing Arrangement Arc Preview, showing action, reason, section/energy scope, move count, and next listening check before users apply an arc pad.

## QA

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed after aligning a README expectation with the feature bullet text.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite large chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke coverage for 14/14 sample-free blueprints and 14/14 supported style profiles.
- `npm run dev` was blocked by sandbox policy with `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy.

## Findings

- No findings.

## Residual Risk

- Local browser/dev-server visual preview was not available because localhost binding is blocked in this environment.

## Follow-Ups

- None.
