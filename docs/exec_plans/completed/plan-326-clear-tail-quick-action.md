# plan-326-clear-tail-quick-action

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose the existing Clear Tail Pattern Fill move from Quick Actions so users can explicitly clean the selected Pattern A/B/C tail from the command palette and receive the same UI-local Pattern Fill Result feedback as the visible Pattern Fill buttons.

## Non-Goals

- Do not change Pattern Fill algorithms or preset definitions.
- Do not change project schema, save/load, undo/redo, playback, render/export, Pattern Fill direct button behavior, Composer Actions, Next Move, Pattern Clone, Pattern Stack, Layer Starter, or Pattern DNA.
- Do not add sampling, imported audio, remote AI, analytics, accounts, cloud sync, macros, autoplay, auto-arrangement, auto-export, or command chains.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation and existing `applyPatternFill` handler.
- `README.md`: public feature summary for Quick Actions Pattern Fill commands.
- `docs/product/product.md`: product behavior for Pattern Fill and command-palette access.
- `docs/quality/rules.md`: guardrails for Pattern Fill and Quick Actions command routing.
- `harness/scripts/run_qa.py`: static expectations for docs/code alignment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-326-clear-tail-quick-action` and `.worktree/plan-326-clear-tail-quick-action` for repository work.

## Implementation Plan

- [x] Inspect current Quick Actions Pattern Fill commands and `applyPatternFill` routing.
- [x] Add a Clear Tail Quick Action that calls the existing `applyPatternFill("clear_tail")` path.
- [x] Update product/quality docs and static QA expectations.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment exposes a callable browser control tool; otherwise record the blocker.

## Review Plan

QA completes before review starts. Review checks that Clear Tail Quick Action is explicit, searchable, routes only through the existing `applyPatternFill("clear_tail")` handler, shows the same UI-local Pattern Fill Result feedback, preserves command search/filter/Spotlight/Recent/Pinned behavior, and avoids project-schema, playback, export, sampling, remote AI, autoplay, macros, or command-chain changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Clear Tail as a direct Quick Action instead of creating a new cleanup workflow. | The visible Pattern Fill row already owns the behavior and result feedback; command-palette access should reuse that explicit path. |
| 2026-06-18 | Reuse the existing `fill-` Quick Action result metric path. | Clear Tail has the same selected Pattern event-count before/after metric as Drum Fill, 808 Pickup, and Melody Turn. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on dedicated worktree from clean `main` at `354e80d`. |
| 2026-06-18 | harness_builder | Added `fill-clear-tail` with title `Clear Pattern Tail`, routed only to `onApplyPatternFill("clear_tail")`. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations so Quick Actions Pattern Fill explicitly covers Drum Fill, 808 Pickup, Melody Turn, and Clear Tail. |
| 2026-06-18 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, and `npm run verify`; verify included 10/10 Beat Blueprints and 10/10 supported style profiles in runtime smoke. |
| 2026-06-18 | quality_runner | Browser smoke was not run because no callable Browser control tool was exposed in this session. |
| 2026-06-18 | review_judge | Reviewed the diff after QA: the command is explicit and searchable, reuses existing Pattern Fill routing/result feedback, and does not change schema, playback, export, sampling, remote AI, autoplay, macros, or command-chain behavior. |
