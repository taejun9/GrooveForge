# plan-516-pattern-compare-decision-readout

## Goal

Add a UI-local Pattern Compare decision readout that recommends whether the user should cue or place one of Pattern A/B/C before clicking a Pattern Compare card or Quick Action.

## Why

Pattern Compare already shows direct A/B/C metrics, but users still have to infer which pattern is ready for audition and which one should be placed into the selected arrangement block. A compact recommendation keeps the workflow centered on direct beat composition, helps beginners choose the next move, and gives producers a quick density/arrangement check without making changes automatically.

## Scope

- Derive the recommended Pattern A/B/C target from existing Pattern Compare summaries, selected pattern, and selected arrangement block pattern.
- Recommend either cueing a pattern for loop audition or placing it into the selected arrangement block.
- Show the target, action, density/arrangement posture, and a short reason.
- Keep the readout UI-local and out of saved project data and undo history.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not auto-cue, auto-place, or reorder Pattern Compare cards.
- Do not change Pattern Compare result semantics, arrangement assignment handlers, playback, export, save/load, or undo/redo behavior.
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

- plan-516 starts after plan-515 completed, main clean, and 515 completed plans recorded.
- Pattern Compare exposes A/B/C event and arrangement metrics, but the panel does not yet summarize which pattern should be cued or placed next.
- Keep the feature centered on sample-free direct beat composition and arrangement decisions.
- Add `PatternCompareDecisionSummary` as UI-only readout data derived from existing Pattern Compare summaries, selected Pattern, and selected arrangement block Pattern.
- Recommend `Use` when the strongest Pattern A/B/C is not in the selected block, recommend `Cue` when it already is, and recommend `Cue and build` instead of arrangement placement when the strongest Pattern is still thin.
- Render `PatternCompareDecision` directly above existing Pattern Compare cards without changing card ordering, saved project schema, undo history, playback, or Cue/Use handlers.
