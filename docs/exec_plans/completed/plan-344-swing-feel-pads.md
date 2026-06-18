# plan-344-swing-feel-pads

## Status

Completed

## Goal

Add explicit Swing Feel Pads so beginners can choose a useful groove feel without guessing slider values and working producers can quickly switch between straight, tight, laid, loose, and current-style swing from the workstation or Quick Actions.

## Scope

- Add local Swing Feel Pad definitions for direct global swing changes.
- Add visible pads beside the existing Swing slider.
- Add Quick Actions for each Swing Feel Pad.
- Add UI-local Swing Feel Result feedback after explicit pad or command runs.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No changes to drum hit timing, note timing, arrangement, mixer, master, export, save/load schema, style definitions, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- No automatic swing changes during style selection, playback, export, or project load.
- No hidden generation or command chains.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
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
- 2026-06-18: `npm run verify` passed, including runtime smoke coverage for 10/10 sample-free 8-bar blueprints and all supported style profiles.
- 2026-06-18: Browser smoke was not run because no in-app browser control tool was available from tool discovery in this session.

## Review

- No findings. Swing Feel Pads and Quick Actions update only the existing `project.swing` value through explicit user actions, use local fixed pad definitions plus the selected style profile for the style target, keep Swing Feel Result feedback UI-local, and preserve manual Swing slider, style selection, Pattern A/B/C event data, playback, save/load, undo/redo, export, sampling, and cloud boundaries.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add Swing Feel Pads instead of another read-only focus surface. | The app already explains groove posture; the next useful gap is making a core timing feel directly adjustable. |
| 2026-06-18 | Limit pads to the existing `project.swing` field. | Swing is already part of project state and style profiles; changing only that field preserves event editability and export semantics. |

## Progress

- [x] Inspected current main and groove/swing UI.
- [x] Created `codex/plan-344-swing-feel-pads` worktree.
- [x] Add Swing Feel Pads and Quick Actions.
- [x] Update docs and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
