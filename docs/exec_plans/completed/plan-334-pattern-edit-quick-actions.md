# plan-334-pattern-edit-quick-actions

## Status

Completed

## Goal

Expose Pattern A/B/C Copy and Clear as explicit Quick Actions commands so producers can duplicate or reset loop ideas from command search, while beginners get the same Pattern Edit Result feedback as the visible copy/clear buttons.

## Scope

- Add Quick Actions Pattern Copy commands from the selected Pattern A/B/C slot to the other Pattern slots.
- Add a Quick Actions Pattern Clear command for the selected Pattern A/B/C slot.
- Route command runs only through the existing `copySelectedPattern` and `clearSelectedPattern` handlers.
- Reuse existing Pattern Edit Result feedback, undo semantics, selected note/drum/chord reset behavior, playback, save/load, export, and project schema.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No new copy, clone, variation, fill, arrangement, playback, export, save/load, undo/redo, project schema, or pattern generation behavior.
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
- `npm run build` passed. Vite reported the existing large client chunk warning for `dist/assets/index-C1B1xCel.js` at 506.80 kB after minification.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including quality gate, runtime smoke, typecheck, and build. Runtime smoke covered 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- Browser smoke was not run because the Browser tool was not exposed in this session after tool discovery; available follow-up tools were thread/automation and multi-agent tools only.

## Review

Post-QA review found no schema, save/load, playback, export, sampling, cloud, or remote-service changes. Pattern Copy/Clear Quick Actions derive from the selected Pattern and `patternSlots`, route only through the existing `copySelectedPattern` and `clearSelectedPattern` handlers, and reuse the existing UI-local Pattern Edit Result behavior. No findings.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add Pattern Copy/Clear Quick Actions instead of new edit tools. | The visible handlers already have the correct undo and Pattern Edit Result behavior; the gap is command-search access for faster composition. |
| 2026-06-18 | Derive copy targets from `patternSlots` and the current selected Pattern. | This keeps Pattern A/B/C independence explicit and avoids self-copy no-ops in command search. |

## Progress

- [x] Inspected current Pattern edit handlers, Quick Actions wiring, and docs/harness expectations.
- [x] Created `codex/plan-334-pattern-edit-quick-actions` worktree.
- [x] Implement Pattern Copy/Clear Quick Actions.
- [x] Update docs and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
