# plan-207-pattern-chain-preview

## Status

Completed.

## Goal

Add a UI-local Pattern Chain Preview in the Arrangement panel so users can see the suggested Pattern Chain or Chain Expand outcome, Pattern A/B/C sequence, section/bar posture, energy posture, and pre-click block move count before applying a chain action.

## User Value

- Beginners can understand how Pattern A/B/C variations will become a song form before clicking.
- Producers can scan chain structure and arrangement coverage quickly while sketching sections.
- The workflow keeps arrangement edits explicit, undoable, and sample-free.

## Non-Goals

- Do not change Pattern Chain definitions, step cycling, Chain Expand definitions, or apply behavior.
- Do not change saved project schema, undo history semantics, playback, render/export, MIDI export, Handoff Sheet, or Handoff Pack file contents.
- Do not add auto-arrangement, hidden generation, remote AI, imported audio, or sampling workflow.

## Scope

- Add `PatternChainPreviewSummary` derived only from current local arrangement state and existing Pattern Chain / Chain Expand transforms.
- Render the preview near the Pattern Chain controls before chain actions.
- Update README/product/quality docs and static QA expectations.
- Preserve existing Pattern Chain preset, step cycle, and Chain Expand behavior.

## QA

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke if localhost dev server is available in this environment. Blocked: `npm run dev -- --host 127.0.0.1 --port 5297` failed with `listen EPERM`, and the escalated retry was rejected by the environment policy.

## Completion Notes

- Added a UI-local Pattern Chain Preview above Pattern Chain controls.
- Preview labels show the suggested Pattern Chain or Chain Expand action, Pattern A/B/C sequence, section/bar posture, energy posture, and pre-click block/field move counts.
- Preview derivation uses current local arrangement state plus existing Pattern Chain and Chain Expand transforms and leaves saved project schema, undo history, preset apply behavior, step cycling, playback, and export behavior unchanged.
- Updated README, product docs, quality rules, and static QA expectations.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Add preview before Pattern Chain actions. | Pattern Chain and Chain Expand rewrite arrangement structure; pre-click clarity helps beginners build songs and helps producers scan arrangement intent quickly. |
| 2026-06-17 | Suggest 8-bar chain for short arrangements, Chain Expand before full-song length, and alternate chain presets after expansion. | This mirrors existing Next Move structure guidance without changing recommendation or apply semantics elsewhere. |
| 2026-06-17 | Record browser smoke as blocked in this environment. | Localhost dev server binding failed with `listen EPERM`, and the escalated retry was rejected by environment policy. |
