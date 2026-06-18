# plan-371-selected-event-reset-actions Review

## Summary

Selected-event reset commands are now available from Quick Actions. Selected 808/Synth note chance and selected chord chance reset to 100%, selected drum chance resets to 100%, selected drum timing resets to On grid, and selected hat repeat resets to 1x. The commands reuse existing selected-event update handlers, stay scoped to the selected Pattern A/B/C slot, and disable when the selected event is missing or already at the reset value.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run harness:smoke` passed with 10/10 Beat Blueprints and 10/10 style profiles.
- `npm run build` passed.
- `npm run qa` passed.
- `npm run verify` passed.

## Findings

- No blocking findings. The reset commands are explicit, no-op guarded, undoable through existing update paths, and do not change project schema, playback, render/export, sampling, imported audio, or remote behavior.

## Residual Risk

- Local browser/dev-server visual QA could not be completed. `npm run dev -- --host 127.0.0.1 --port 5178` failed with `listen EPERM`, and the escalated retry was rejected by environment policy. The feature is covered by static QA, typecheck, runtime smoke, and production build, but command-palette runtime interaction was not browser-click verified in this environment.

## Follow-Ups

- When a local dev server is available, smoke the Quick Actions search for `reset selected note chance`, `reset selected drum timing`, `reset selected drum chance`, `reset selected hat repeat`, and `reset selected chord chance`, then confirm disabled states after each value is already reset.
