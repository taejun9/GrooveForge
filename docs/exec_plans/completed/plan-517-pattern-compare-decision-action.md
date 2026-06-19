# plan-517-pattern-compare-decision-action

## Goal

Add an explicit Pattern Compare Decision action button so the current Cue/Use recommendation can be run directly from the readout.

## Why

The Pattern Compare Decision Readout tells users what to do next, but beginners still need to map the recommendation back to the matching A/B/C card button. Producers also benefit from a faster single-click path for the currently strongest Pattern decision. The action should keep the workflow explicit and local while reducing friction in direct beat composition.

## Scope

- Add a single explicit action button to the Pattern Compare Decision Readout.
- Route the button through the existing Pattern Compare Cue or Use handlers based on the current recommendation.
- Preserve Pattern Compare card ordering, visible Cue/Use card controls, result behavior, playback, save/load, export, and undo semantics.
- Keep the action UI-local and out of saved project data.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not auto-cue, auto-place, autoplay, or run the recommendation without a user click.
- Do not change the Pattern Compare recommendation scoring.
- Do not change Pattern Compare result derivation, arrangement assignment semantics, Pattern A/B/C event data, playback, export, save/load, or undo/redo behavior.
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

- plan-517 starts after plan-516 completed, main clean, and 516 completed plans recorded.
- Pattern Compare Decision currently gives a useful recommendation, but the user must still find the matching Pattern Compare card button to act on it.
- Keep the improvement centered on sample-free direct beat composition and explicit A/B/C arrangement decisions.
- Add a `PatternCompareDecision` action button that displays Cue or Use for the recommended Pattern target.
- Route the action button through `cuePatternFromCompare` or `usePatternInSelectedBlockFromCompare`, preserving existing result labels and arrangement/preview semantics.
- Keep the action explicit and UI-local with no auto-cue, auto-place, autoplay, project schema change, or undo-history change beyond the existing Use path.
