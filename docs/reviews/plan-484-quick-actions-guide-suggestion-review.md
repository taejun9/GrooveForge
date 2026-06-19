# plan-484-quick-actions-guide-suggestion review

## Summary

Added a UI-local Quick Actions guide suggestion card that surfaces the current `guide-quick-start` command when the command palette opens with an empty search in All or Project scope.

## QA

| command | result |
|---|---|
| `git diff --check` | passed |
| `python3 harness/scripts/run_qa.py` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run typecheck` | passed |
| `npm run build` | passed with existing Vite large chunk warning |
| `npm run qa` | passed |
| `npm run verify` | passed with existing Vite large chunk warning; runtime smoke passed 14/14 blueprints and 14/14 style profiles |
| `npm run dev -- --host 127.0.0.1` | blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy |

## Findings

- No blocking findings.
- The suggestion is derived from current Quick Action definitions and does not create a second command execution path.
- The suggestion run button routes through `onRun(guideSuggestionAction)`, preserving Quick Action Result and Recent Commands behavior.
- The suggestion appears only for empty-search All or Project scope and does not alter filtering, result ordering, Spotlight Enter behavior, pins, recents, or command ranking.
- No project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior changed.

## Follow-Up

- Browser verification remains unavailable in this environment until local dev server binding is permitted.
