# plan-342-direct-blueprint-quick-actions

## Status

Completed

## Goal

Expose every Beat Blueprint as direct Quick Actions for Preview and Apply so beginners can start a sample-free beat in a chosen genre from command search, while working producers can rapidly switch complete editable starter sessions without opening the Blueprint list first.

## Scope

- Add direct Quick Actions for previewing each existing Beat Blueprint.
- Add direct Quick Actions for applying each existing Beat Blueprint through the current undoable Beat Blueprint apply/result path.
- Keep the existing generic Blueprint command, current-style starter Preview/Apply commands, Beat Blueprint panel behavior, Preview/Result strips, undo/redo, save/load, playback, WAV/stem/MIDI export, Handoff Sheet, Handoff Pack, and sampling boundaries unchanged.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No new Beat Blueprint definitions or style profiles.
- No hidden generation, auto-apply, command chaining, modal confirmation, autoplay, auto-save, auto-export, imported audio, sampling, sampler devices, remote AI, accounts, analytics, or cloud sync.
- No changes to Beat Blueprint project content, render engines, export bytes, or saved project schema.

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

- 2026-06-18: `npm run typecheck` passed.
- 2026-06-18: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-18: `git diff --check` passed.
- 2026-06-18: `npm run build` passed with the existing Vite large chunk warning.
- 2026-06-18: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-18: `npm run qa` passed.
- 2026-06-18: `npm run verify` passed, including runtime smoke for 10/10 sample-free Beat Blueprints and all 10 supported style profiles.
- 2026-06-18: Browser smoke was not run because `tool_search` exposed thread/automation/sub-agent tools but no in-app Browser control tool in this session.

## Review

- No findings. Direct Blueprint Preview commands route only through existing preview state and reveal the existing Beat Blueprints panel.
- Direct Blueprint Apply commands route only through the existing undoable Beat Blueprint apply/result path; no Blueprint definitions, style profiles, saved project schema, export bytes, playback path, sampling boundary, remote AI, account, analytics, or cloud behavior changed.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add direct Blueprint Preview and Apply Quick Actions instead of new starter content. | Existing Blueprints already cover all supported genres; the missing workflow is fast command-palette access to each sample-free starter. |
| 2026-06-18 | Route commands through existing preview/apply handlers. | This preserves explicit user intent, undoable apply behavior, UI-local preview/result state, and sampling boundaries. |

## Progress

- [x] Inspected current main and Beat Blueprint Quick Actions.
- [x] Created `codex/plan-342-direct-blueprint-quick-actions` worktree.
- [x] Add direct Blueprint Preview and Apply Quick Actions.
- [x] Update docs and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
