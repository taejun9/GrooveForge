# plan-519-pattern-compare-decision-quick-result

## Goal

Make the Quick Actions result strip explain the current Pattern Compare Decision command with Pattern-specific status, metric, audition cue, and next check.

## Why

The visible Pattern Compare Decision already creates local Pattern Compare feedback, and the command is now searchable. The command-palette result should also tell beginners and keyboard-driven producers whether the recommendation cued a Pattern loop or placed a Pattern into the selected arrangement block, instead of falling back to generic project-event language.

## Scope

- Add `pattern-compare-decision` handling to Quick Action result status, metric snapshot, tone, and follow-up text.
- Derive the result only from the existing Quick Action title/detail and before/after local project Pattern/arrangement state.
- Preserve visible Pattern Compare Decision, Pattern Compare Result Strip, direct Pattern Cue/Switch/Use commands, playback, save/load, export, and Handoff behavior.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not change Pattern Compare recommendation scoring, visible card ordering, or Pattern Compare Result derivation.
- Do not add a new command, command chain, automatic cue, automatic arrangement placement, autoplay, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- plan-519 starts after plan-518 completed and main is clean with 518 completed plans.
- Pattern Compare Decision has a Quick Action, but the shared Quick Action Result can still read like a generic project-event command.
- Keep the fix in the existing Quick Action Result derivation layer so command search feedback remains UI-local and separate from project schema.
- The shared Quick Action Result now treats `pattern-compare-decision` Cue recommendations as cue feedback and Use recommendations as arrangement placement feedback.
- The result metric derives from the command title target plus before/after selected Pattern or arrangement usage, without adding saved schema or new command state.
