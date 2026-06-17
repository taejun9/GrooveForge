# plan-247-layer-starter-quick-action

## Goal

Add a Quick Actions command that applies the highest-priority missing or thin Layer Starter option so users can seed the selected Pattern's drums, 808, chords, or synth layer from command search through the existing undoable Layer Starter path.

## Non-Goals

- Do not add new layer-generation logic, hidden recommendations, auto-arrangement, or background command chains.
- Do not overwrite ready layers from the command palette; disable the command when no Layer Starter option is missing or thin.
- Do not change Layer Starter scoring, starter preset selection, project schema, saved files, playback, export behavior, or undo semantics.
- Do not add sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Layer Starter options, existing `applyLayerStarter`, result metrics, and follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for Layer Starter and Quick Actions work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `layerStarterOptions` and `applyLayerStarter` into Quick Actions.
- [x] Add a `layer-starter` command using the current highest-priority missing/thin Layer Starter option and disable it when all options are ready.
- [x] Add Layer Starter-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will choose `danger` before `warn` and will not run when every Layer Starter option is `good`. This keeps the command focused on direct-composition gaps instead of overwriting already-ready layers.

## Progress Log

- Started from clean `main` at `3ba3e26` in worktree `.worktree/plan-247-layer-starter-quick-action`.
- Added `activeLayerStarterQuickActionOption` so Quick Actions chooses missing (`danger`) Layer Starter options before thin (`warn`) options and returns no runnable option when all layers are ready.
- Wired the `layer-starter` Quick Action to existing `applyLayerStarter`, with result metric and follow-up copy derived from local project state.
- Updated README, product docs, quality rules, and harness checks to keep the command direct-composition-first and sample-free.

## QA Log

- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run typecheck`
- Passed: `npm run qa`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run verify`
- Blocked: `npm run dev` could not bind `127.0.0.1:5173` in the sandbox (`listen EPERM`). The escalated retry was rejected by the environment policy, and `dist/index.html` uses `/assets/...` absolute asset paths, so `file://` Browser smoke cannot load the built app correctly without a server.

## Review

- Reviewed after QA. No blocking findings.
- The command uses existing Layer Starter option state, routes mutation through the existing undoable `applyLayerStarter` path, and no-ops/appears disabled when every layer is ready.
- No project schema, playback, export, sampler, imported-audio, remote AI, analytics, account, payment, or cloud-sync behavior changed.
