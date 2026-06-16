# plan-124-workflow-navigator

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a compact Workflow Navigator that lets users jump between Compose, Arrange, Mix, and Deliver zones without changing the beat. It should help beginners follow the production path and help working producers move quickly across the dense desktop workstation.

## Non-Goals

- Do not mutate project musical events, arrangement blocks, mixer, master, Delivery Target, Session Brief, snapshots, playback, save/load, or export state.
- Do not add hidden automation, auto-generation, auto-export, background rendering, remote AI, accounts, analytics, cloud sync, plugin hosting, imported audio, or sampling workflow.
- Do not replace existing Mode Focus, Composer Guide, Beat Map, Next Move, Handoff Pack, or panel controls.
- Do not hide existing controls by mode.

## Context Map

- Top-level layout and refs: `src/ui/App.tsx`
- Styling: `src/styles.css`
- Product docs: `README.md`, `docs/product/product.md`
- Quality rules and static harness: `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-124-workflow-navigator` and `.worktree/plan-124-workflow-navigator`.
- Workflow Navigator must remain local, explicit, deterministic, and UI-only.

## Implementation Plan

- [x] Inspect current top-level panels, refs, and layout order.
- [x] Add navigator model, refs, and scroll handlers for Compose, Arrange, Mix, and Deliver.
- [x] Render compact jump controls near Mode Focus without layout overflow.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, verify, and browser smoke for buttons and responsive layout.
- [x] Complete review docs and prepare the branch for merge, push, and worktree cleanup.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke:
  - Workflow Navigator appears with Compose, Arrange, Mix, and Deliver buttons.
  - Clicking each button scrolls to the intended local section without console errors.
  - The navigator does not create horizontal overflow at desktop and 1180px responsive widths.

## Review Plan

QA completes before review starts. Review checks local UI-only behavior, no project mutation, no mode-based control hiding, beginner/pro usefulness, no sampling-first drift, and layout regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Workflow Navigator instead of another read-only status panel. | The app has many production surfaces now; navigation speed and workflow clarity directly support both beginners and working producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-124 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Inspected top-level orientation panels, workspace-grid sections, existing refs, and Handoff/export placement. |
| 2026-06-16 | 제작 | Added Workflow Navigator items, section refs, scroll handlers, compact button UI, and responsive styling for Compose, Arrange, Mix, and Deliver jumps. |
| 2026-06-16 | harness_builder | Updated README, product docs, quality rules, and static QA expectations for UI-only workflow navigation guardrails. |
| 2026-06-16 | 검증 | `npm run typecheck`, `npm run qa`, `npm run verify`, and `git diff --check` passed. Browser smoke confirmed four buttons, target section jumps, unchanged project status, zero console errors, and no horizontal overflow at 1280px and 1180px. |
| 2026-06-16 | 심사 | Reviewed UI-only behavior, no project mutation, no hidden automation, no mode-based control hiding, and no sampling-first drift. |

## Completion Notes

Completed. Workflow Navigator now provides compact local Compose, Arrange, Mix, and Deliver jump buttons derived from current workflow state. It scrolls to existing workstation sections without mutating project data, undo history, playback, save/load, export state, or mode-specific control visibility.
