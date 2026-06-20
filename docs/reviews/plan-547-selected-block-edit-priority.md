# plan-547-selected-block-edit-priority Review

## Summary

Added a UI-local Selected Block Edit Priority Readout to the selected arrangement block editor. The readout recommends the safest next manual structure edit from local selected-block, neighbor-block, clipboard, block-count, bar-count, and song-length state while existing copy, paste, duplicate, split, merge, move, and delete controls remain the only edit paths.

## QA

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed after correcting the App-only QA token list.
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
