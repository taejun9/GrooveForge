# plan-335-pattern-chain-direct-quick-actions

## Status

Completed

## Goal

Expose every visible Pattern Chain preset as a direct Quick Actions command so beginners can search for song-form sketches and producers can apply Hook Switch or Break Turn chains without hunting through the Arrangement panel.

## Scope

- Add direct Quick Actions commands for all `patternChainIds`.
- Route every Pattern Chain command only through the existing `applyPatternChain` handler.
- Keep the existing Chain Expand command routed through `expandPatternChain`.
- Reuse existing Pattern Chain Preview/Result behavior, undo semantics, selected block/pattern alignment, playback, save/load, export, and project schema.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No new Pattern Chain presets, Chain Expand transforms, arrangement templates, arrangement focus behavior, playback, export, save/load, undo/redo, project schema, or pattern generation behavior.
- No command chains, macros, autoplay, auto-arrangement, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run build`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`

## QA Log

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run build` passed. Vite reported the existing large client chunk warning for `dist/assets/index-CAjPAgtK.js` at 507.14 kB after minification.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including quality gate, runtime smoke, typecheck, and build. Runtime smoke covered 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- Browser smoke was not run because the Browser tool was not exposed in this session after tool discovery; available follow-up tools were automation and multi-agent tools only.

## Review

Post-QA review found no schema, save/load, playback, export, sampling, cloud, or remote-service changes. Pattern Chain Quick Actions derive from `patternChainIds`, route only through the existing `applyPatternChain` handler, keep Chain Expand on the existing `expandPatternChain` handler, and reuse the existing UI-local Pattern Chain Result behavior. No findings.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Derive direct Pattern Chain commands from `patternChainIds`. | Visible Pattern Chain buttons already expose every chain preset; Quick Actions should not collapse that choice to only the 8 Bar Chain. |
| 2026-06-18 | Route all commands through `applyPatternChain`. | The existing handler already preserves undo, selected block/pattern alignment, Pattern Chain Result feedback, playback, export, and project schema. |

## Progress

- [x] Inspected current Pattern Chain buttons, Quick Actions command, docs, and QA expectations.
- [x] Created `codex/plan-335-pattern-chain-direct-quick-actions` worktree.
- [x] Implement direct Pattern Chain Quick Actions.
- [x] Update docs and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
