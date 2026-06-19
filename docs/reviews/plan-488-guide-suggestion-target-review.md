# plan-488-guide-suggestion-target review

## Summary

Added a compact display-only target chip to the Quick Actions Guide Quick Start suggestion card so users can see the specific current guide target before running or pinning the command.

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
- The suggestion target chip is derived from the current `guide-quick-start` Quick Action title/detail text and is display-only.
- Guide Quick Start target selection, source metadata, reason line, pin-state metadata, Run behavior, and Pin/Unpin behavior are unchanged.
- The change does not alter command execution, Quick Actions filtering, filtered order, Spotlight Enter target, Recent Commands, command ranking, project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior.

## Follow-Up

- Browser verification remains unavailable in this environment until local dev server binding is permitted.
