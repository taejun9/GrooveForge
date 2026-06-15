# plan-091-master-finish-pads

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add Master Finish Pads to the Master panel so beginners can choose a useful finishing posture quickly and producers can set common demo, vocal, beat-store, or club preview master states without losing editability.

## Non-Goals

- No LUFS, true-peak, platform compliance, release guarantee, automatic mastering claim, or remote analysis.
- No sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No new project schema fields.
- No mutation of Pattern A/B/C musical events, arrangement blocks, sound design, non-master mixer channels, Delivery Target, Session Brief, snapshots, or export commands.

## Context Map

- `src/ui/App.tsx`: Master panel, master preset handler, mixer state updates, local pad patterns.
- `src/domain/workstation.ts`: `MasterPreset`, master preset ceiling defaults, mixer channel model.
- `src/audio/render.ts`: deterministic render path that consumes master ceiling and master channel output.
- `src/styles.css`: Master panel and pad layout styles.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-091-master-finish-pads` and `.worktree/plan-091-master-finish-pads` for git repository work.
- Master Finish Pads must be deterministic, explicit-click, undoable, and editable afterward through existing master preset, ceiling, and mixer master controls.
- Master Finish Pads update only `masterPreset`, `masterCeilingDb`, and the master mixer channel volume through existing project history.

## Implementation Plan

- [x] Add Master Finish Pad definitions and option summaries derived from current master state.
- [x] Add an undoable app handler that applies a selected pad to master state only.
- [x] Render Master Finish Pads in the Master panel with compact labels, target readouts, and changed-state counts.
- [x] Style the pads without disrupting the existing Master meter, Mix Coach, or mixer layout.
- [x] Update durable docs and QA expectations for the finishing workflow.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Master Finish Pads render, applying a pad changes master preset/ceiling/master output, Undo restores the previous state, console errors stay empty, and the workstation has no incoherent overflow.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that Master Finish Pads remain local, deterministic, undoable, honest about mastering limits, and limited to master state.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Master Finish Pads after mix and sound focus controls. | Beginners need a clear finishing target after composing/mixing; producers need fast editable master postures for demo, vocal, store, and club preview contexts. |
| 2026-06-16 | Keep pads limited to master preset, ceiling, and master output gain. | This avoids hidden mastering, preserves mix decisions, and keeps every change visible through existing controls. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Master Finish Pads. |
| 2026-06-16 | harness_builder | Added Demo, Vocal, Store, and Club Master Finish Pads that update only master preset, ceiling, and master output gain. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for Master Finish Pads. |
| 2026-06-16 | quality_runner | Ran typecheck, static QA, verify, browser smoke, npm QA, and diff whitespace checks. |
| 2026-06-16 | review_judge | Reviewed state scope, undoability, manual editability, UI density, and no automatic mastering claims. |

## Completion Notes

Master Finish Pads are implemented as explicit local output-posture controls inside the Master panel. Applying a pad updates only master preset, master ceiling, and master channel output gain through project history while preserving manual editability.
