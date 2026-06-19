# plan-518-pattern-compare-decision-quick-action

## Goal

Expose the current Pattern Compare Decision as a Quick Actions command so users can run the recommended Cue/Use move from command search.

## Why

The visible Pattern Compare Decision action helps inside the Compose panel, but keyboard-driven producers and beginners using search still need a single current recommendation command. A Quick Actions entry keeps the A/B/C decision fast without adding automation or a new arrangement path.

## Scope

- Add one current Pattern Compare Decision Quick Action derived from the existing decision summary.
- Route the command through the same explicit Pattern Compare Decision handler used by the readout button.
- Include command title, detail, keywords, and disabled state derived only from local Pattern Compare decision data.
- Preserve direct Pattern Cue/Use commands, visible cards, readout button, result behavior, playback, save/load, export, and undo semantics.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not auto-run the decision, command-chain it, or hide direct Pattern Cue/Use commands.
- Do not change the Pattern Compare recommendation scoring or Pattern Compare result derivation.
- Do not change Pattern A/B/C event data except through existing explicit Cue/Use paths.
- Do not add sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.

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

- plan-518 starts after plan-517 completed, main clean, and 517 completed plans recorded.
- Pattern Compare Decision can now be clicked in the panel, but it is not available from command search as the current recommended A/B/C move.
- Keep the improvement centered on sample-free direct beat composition and explicit A/B/C cue/use decisions.
- Add a single `pattern-compare-decision` Quick Action using the existing `PatternCompareDecisionSummary`.
- Route the command through `runPatternCompareDecision`, preserving the same explicit readout button path and existing Pattern Compare Result behavior.
- Keep direct Pattern Cue, Switch, and Use commands available for manual A/B/C decisions.
