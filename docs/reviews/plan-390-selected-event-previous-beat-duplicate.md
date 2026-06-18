# plan-390-selected-event-previous-beat-duplicate Review

## Summary

Added Quick Actions for selected-note, selected-drum, and selected-chord previous beat duplicate commands. The commands derive the nearest earlier empty 4-step beat-grid anchor in the selected Pattern A/B/C slot, then route through the existing selected-event duplicate-to-step handlers and undoable pattern update paths.

## QA

- `git diff --check`: pass
- `python3 harness/scripts/run_qa.py`: pass
- `npm run typecheck`: pass
- `python3 harness/scripts/run_quality_gate.py`: pass
- `npm run harness:smoke`: pass, 10/10 sample-free blueprints and 10/10 supported style profiles
- `npm run build`: pass, with existing large chunk warning for `index-04E3BkXD.js`
- `npm run qa`: pass
- `npm run verify`: pass
- `npm run dev -- --host 127.0.0.1 --port 5197`: blocked by `listen EPERM`; escalated retry was rejected by policy

## Findings

No blocking issues found. Previous-beat target derivation stays inside Quick Actions, rejects unavailable targets, preserves event fields and UI-local clipboards, and reuses the same explicit selected-pattern insertion/edit paths as existing beat duplicate behavior.

## Residual Risk

Browser-level interaction remains unverified because localhost binding is blocked in this environment.

## Follow-Ups

No immediate follow-up required.
