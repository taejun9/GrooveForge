# plan-338-mix-coach-focus-quick-actions

## Status

Completed

## Goal

Expose Mix Coach Focus through Quick Actions so beginners can jump directly to the current mix issue and producers can scan headroom, limiter, stem balance, and low-end checks from command search without applying a fix.

## Scope

- Add a Quick Actions Mix Coach focus command for the current highest-priority deterministic Mix Coach check.
- Add direct Quick Actions commands for each existing Mix Coach check.
- Route command runs only through the existing Mix Coach focus path and master panel scroll behavior.
- Keep focused-check state UI-local and preserve Mix Coach thresholds, Mix Fix actions, mixer/master data, export behavior, playback, save/load, undo/redo, and Handoff behavior.
- Add local Quick Action result metric/follow-up text for Mix Coach focus command runs.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No Mix Coach threshold changes, new mix checks, new Mix Fix presets, automatic fixing, mixer/master mutation, export changes, playback changes, command chains, autoplay, auto-export, sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.

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
- `npm run build` passed. Vite reported the existing large client chunk warning for `dist/assets/index-D3azrZkT.js` at 512.38 kB after minification.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including quality gate, runtime smoke, typecheck, and build. Runtime smoke passed 10/10 sample-free Beat Blueprints and 10/10 supported style profiles. Vite reported the same existing large client chunk warning.
- In-app Browser smoke was not run because `tool_search` did not expose a Browser automation tool in this session.

## Review

Post-QA review found no blocking issues. The change adds explicit Mix Coach focus Quick Actions and direct Mix Coach check commands, derives them from existing deterministic Mix Coach checks, routes command runs through the existing UI-local focus state and master panel scroll path, and adds only local Quick Action result metric/follow-up text. It does not change Mix Coach thresholds, Mix Fix behavior, mixer/master data, playback, render/export, project schema, saved files, sampling scope, remote AI, accounts, analytics, or cloud sync.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add focus commands instead of more mix-fix automation. | The product already has explicit Mix Fix actions; this task improves navigation and diagnosis without changing mix data. |
| 2026-06-18 | Reuse existing Mix Coach check derivation and focus state. | It preserves deterministic local analysis and keeps focus state UI-only. |
| 2026-06-18 | Route Mix Coach focus to the existing master panel path. | The current Mix Coach UI is rendered inside the Master panel, so direct Quick Actions should reuse that established focus/scroll behavior. |

## Progress

- [x] Inspected current main, active plans, Mix Coach docs, and existing Mix Coach focus surface.
- [x] Created `codex/plan-338-mix-coach-focus-quick-actions` worktree.
- [x] Implement Mix Coach Focus Quick Actions.
- [x] Update docs and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
