# plan-804-workflow-spotlight-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make the Workflow Spotlight Quick Action result metric identify the explicit spotlight focus action, Guide destination, derived spotlight zone, spotlight status/context, selected Delivery Target, ready/review/blocker workflow counts, selected Pattern, editable event count, Pattern A/B/C usage, arrangement block count, song length, export readiness, stem readiness, audition cue, and next workflow check so beginners know why the app jumped to that workflow zone and working producers can scan the current bottleneck from command results.

## Non-Goals

- Do not change Workflow Spotlight derivation, Workflow Navigator item derivation, item order, visible spotlight card, visible Decision Readout, jump routing, Workflow Navigator Jump Result labels, Beat Map, Structure Lens, Export Preflight, project data, arrangement data, Pattern data, mixer/master state, export handlers, file contents, filenames, project schema, save/load, undo/redo, playback, snapshots, local drafts, or Handoff Pack behavior.
- Do not add hidden generation, auto-run, macros, autoplay, auto-arrangement, batch export, background rendering, sampling, sampler devices, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, publishing/licensing claims, platform-loudness compliance, or LUFS/true-peak guarantees.

## Context Map

- `src/ui/App.tsx` owns Quick Actions result metrics, Workflow Spotlight action creation, Workflow Navigator items/actions, and local result feedback.
- `src/ui/workstationGuidancePanels.tsx` owns Workflow Spotlight summary derivation and visible guidance panels.
- `README.md` and `docs/product/product.md` describe Workflow Spotlight and command-map coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Quick Actions, Workflow Spotlight, local-first behavior, direct beat-composition scope, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-804-workflow-spotlight-result-clarity` and `.worktree/plan-804-workflow-spotlight-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Workflow Spotlight Quick Action result metric routing, spotlight summary fields, and docs/QA expectations.
- [x] Add structured Workflow Spotlight result metric details without changing spotlight derivation, jump routing, or project data.
- [x] Update product/docs language and QA harness expectations for Workflow Spotlight result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Workflow Spotlight result metrics are clearer while preserving Workflow Spotlight derivation, Workflow Navigator item derivation, item order, jump routing, visible Decision Readout behavior, project data, playback, export behavior, remote boundaries, platform-loudness boundaries, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve Workflow Spotlight Quick Action result metrics instead of changing spotlight derivation or navigation behavior. | The app already routes Workflow Spotlight through the existing Workflow Navigator jump path; richer result metrics make the current workflow bottleneck clearer without changing project data or command execution. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 803 completed plans to continue improving first-time and producer-facing workflow clarity. |
| 2026-06-26 | plan_keeper | Found Workflow Spotlight Quick Actions already routed through the existing Workflow Navigator jump path, but the command result metric only exposed selected Pattern and song length; added a Workflow Spotlight-specific result metric/follow-up helper and pinned docs/QA expectations while preserving spotlight derivation and jump routing. |

## QA Log

| command | result |
|---|---|
| `git diff --check` | Passed. |
| `python3 harness/scripts/run_qa.py` | Passed: `GrooveForge QA passed.` |
| `npm run typecheck` | Passed. |
| `python3 harness/scripts/run_quality_gate.py` | Passed: `GrooveForge quality gate passed.` |
| `npm run build` | Passed with existing Vite chunk-size warning. |
| `npm run qa` | Passed: `GrooveForge QA passed.` |
| `npm run verify` | Passed with runtime smoke, typecheck, and build; build emitted existing Vite chunk-size warning. |

## Review Log

Post-QA review passed. The diff keeps Workflow Spotlight derivation, visible Decision Readout behavior, direct Quick Action creation, disabled state, and the existing `onFocusWorkflowSpotlight(workflowSpotlightItem)` route intact; the added helper only expands Quick Actions result metrics/follow-up copy from local project, Workflow Navigator, Beat Map, Export Preflight, export, stem, and spotlight state. No project schema, playback, save/load, render/export, remote, or sampler behavior changes were found.
