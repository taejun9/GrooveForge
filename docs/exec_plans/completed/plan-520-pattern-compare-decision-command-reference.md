# plan-520-pattern-compare-decision-command-reference

## Goal

Add Pattern Compare Decision to Command Reference so users can find and understand the current Cue/Use recommendation command from Help/search.

## Why

Pattern Compare Decision is now visible, runnable from Quick Actions, and has Pattern-specific command result feedback. Command Reference should also name the command directly so beginners can discover what it does and producers can confirm the command-map target without opening the pattern panel first.

## Scope

- Add a Create-section Command Reference item for Pattern Compare Decision.
- Keep the reference entry descriptive only; it must not run commands or change project data.
- Update README, product docs, quality rules, and harness expectations.

## Non-Goals

- Do not change Quick Actions filtering, ranking, command execution, Pattern Compare scoring, visible Pattern Compare UI, playback, project schema, undo history, exports, or Handoff behavior.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, command chains, auto-cueing, or auto-arranging.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run typecheck`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Blocked by environment: `npm run dev -- --host 127.0.0.1` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`.
- Escalated dev server retry requested for the same command and rejected by environment policy, so no browser preview was possible in this sandbox.

## Decision Log

- plan-520 starts after plan-519 completed and main is clean with 519 completed plans.
- Pattern Compare Decision is searchable in Quick Actions but not called out separately in the static Command Reference Create section.
- Add a reference-only entry that points to the current Cue/Use recommendation and preserves the existing command behavior.
- README, product docs, quality rules, and harness expectations now treat Pattern Compare Decision as part of the current read-only command map.
