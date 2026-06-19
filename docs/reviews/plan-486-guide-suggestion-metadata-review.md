# plan-486-guide-suggestion-metadata review

## Summary

Added display-only source and pin-state metadata to the Quick Actions Guide Quick Start suggestion card so users can see whether the command routes through Path, Session, or Workflow and whether it is currently pinned before running or pinning it.

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
- Suggestion source metadata is derived from the current `guide-quick-start` Quick Action detail text and is display-only.
- Suggestion pin-state metadata is derived from the current pinned action ids and is display-only.
- Run and Pin/Unpin controls continue to use the existing guide suggestion execution and pinned-command handlers.
- The change does not alter command execution, Quick Actions filtering, filtered order, Spotlight Enter target, Recent Commands, command ranking, project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior.

## Follow-Up

- Browser verification remains unavailable in this environment until local dev server binding is permitted.
