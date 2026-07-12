# plan-1419-compose-first-editors

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Put direct drum programming ahead of pattern analysis and transformation tools, and keep global command feedback visible even when the Guide & Review Center is collapsed.

## Non-Goals

- Removing pattern comparison, DNA, clone, stack, variation, fill, or generation capabilities.
- Redesigning every editor panel in one change.
- Changing project data, audio rendering, playback, exports, or file formats.
- External distribution, private release values, cloud services, or sampling-first work.

## Context Map

- `src/ui/App.tsx`: top-level command results and drum editor composition.
- `src/styles.css`: drum panel and disclosure layout.
- `harness/scripts/run_renderer_smoke.mjs`: first-render hierarchy regression checks.
- `harness/scripts/run_workflow_smoke.mjs`: beginner and producer composition coverage.
- `harness/scripts/run_qa.py`: source-contract QA.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve event-based, sample-free, local-first direct composition.

## Implementation Plan

- [x] Move global undo/redo and Quick Action result strips outside the collapsed guide center.
- [x] Group advanced pattern analysis and transformation controls into a collapsed-by-default Pattern Lab.
- [x] Keep pattern selection, playback context, and the 16-step drum grid immediately visible.
- [x] Add mode-aware summary context, keyboard disclosure semantics, and responsive styling.
- [x] Add renderer assertions for visible global feedback ordering and compose-first drum hierarchy.
- [x] Run targeted QA, full product verification in scope, and a separate review.

## QA Plan

- Run `npm run renderer:smoke`.
- Run `npm run workflow:smoke` and `npm run persona:smoke`.
- Run `npm run typecheck`, `npm run build`, and `npm run qa`.
- Run live Electron launch smoke and project I/O smoke.
- Run `git diff --check`.

## Review Plan

QA completes before review starts. Review checks direct-edit discoverability, advanced-tool preservation, command feedback visibility, disclosure accessibility, and beginner/producer regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-12 | Treat hidden global Quick Action feedback as a plan-1418 follow-up regression. | Command results must remain visible regardless of whether optional guidance is open. |
| 2026-07-12 | Collapse advanced pattern tooling rather than remove it. | Beginners need the drum grid first, while producers still need comparison, variation, fill, and transformation depth on demand. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-12 | project_lead | Plan created in the dedicated feature worktree. |
| 2026-07-12 | repo_cartographer | Source audit found 20+ pattern helper surfaces before the first drum step and global command results inside the collapsed guide center. |
| 2026-07-12 | harness_builder | Added Pattern Lab disclosure, compose-first ordering, persistent global feedback placement, and responsive styling. |
| 2026-07-12 | quality_runner | QA, typecheck, renderer, workflow, persona, build, live Electron layout, visual, and native project I/O checks passed. |
| 2026-07-12 | review_judge | Separate post-QA diff review found no blocking issue; all advanced tools remain in the DOM and keyboard-accessible while direct drum editing is primary. |

## Completion Notes

Moved global Undo/Redo and Quick Action result strips outside the optional Guide & Review Center so command feedback remains available when guidance is collapsed. Grouped pattern comparison, DNA, generators, cloning, stacking, variation, and fill controls into a keyboard-accessible, collapsed-by-default Pattern Lab. Pattern selection, playback context, and the 16-step drum grid now form the default drum-writing path.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `git diff --check` passed. Live Electron evidence confirms Guide collapsed, Pattern Lab collapsed, feedback outside guide, and step grid after lab. External distribution was not exercised or claimed.
