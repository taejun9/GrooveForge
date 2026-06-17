# plan-238-workflow-spotlight-jump

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Complete GrooveForge as a desktop app that can satisfy working producers while remaining easy for first-time composers. Keep direct beat composition central and sampling secondary.

## Goal

Make Workflow Spotlight an explicit jump control so users can click the highlighted next blocker/review/clear zone directly instead of scanning the Workflow Navigator cards again. This improves beginner guidance and producer navigation speed without changing project data.

## Non-Goals

- Do not change Workflow Navigator item derivation, scoring, ordering, or jump target selection.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, auto-save, auto-export, or hidden generation.
- Do not change project schema, playback, audio rendering, WAV/stem/MIDI export, Handoff behavior, sampling, imported audio, remote AI, plugin hosting, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Workflow Navigator and Workflow Spotlight rendering.
- `src/styles.css`: Workflow Spotlight styling.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: product feature definition.
- `docs/quality/rules.md`: Workflow Spotlight guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-238-workflow-spotlight-jump` and `.worktree/plan-238-workflow-spotlight-jump` for git repository work.

## Implementation Plan

- [x] Turn the Workflow Spotlight readout into an explicit button that reuses the existing `onJump` route for its derived `zoneId`.
- [x] Keep the no-zone state disabled/read-only.
- [x] Preserve Workflow Navigator card behavior, item derivation, scoring, and layout.
- [x] Update README/product/quality docs and static QA expectations.
- [x] Run QA, then review after QA passes.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Workflow Spotlight still derives from visible navigator items, routes only through existing workflow jump behavior, stays UI-local, preserves source scoring/order, and does not touch project data, playback, render/export, schema, sampling, or remote/cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Make the existing Workflow Spotlight clickable instead of adding a new navigation surface. | The app already computes the right next zone; using it as the explicit jump target reduces friction without adding duplicate UI or hidden automation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Selected Workflow Spotlight jump as the next beginner/pro workflow-speed increment. |
| 2026-06-17 | harness_builder | Converted Workflow Spotlight from readout to explicit jump button using the existing `onJump` path and disabled no-zone state. |
| 2026-06-17 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for Workflow Spotlight jump behavior. |
| 2026-06-17 | quality_runner | QA passed: run_qa, diff-check, typecheck, npm qa, quality gate, build, and verify. Browser smoke was attempted but localhost dev server binding failed with `listen EPERM`, and the escalated retry was rejected by environment policy. |
| 2026-06-17 | review_judge | Reviewed explicit Spotlight jump behavior, disabled no-zone state, existing `onJump` reuse, source scoring/order preservation, and no project data/playback/export/sampling/remote scope changes. |

## Completion Notes

Implemented Workflow Spotlight as an explicit button that uses its derived `zoneId` to call the existing Workflow Navigator `onJump` path. The no-zone state is disabled, existing Workflow Navigator cards keep their behavior, and styling preserves the spotlight readout while adding hover affordance for enabled states.

The change preserves Workflow Navigator item derivation, item order, scoring, project data, undo history, playback, audio rendering, WAV/stem/MIDI export, Handoff behavior, Quick Actions, sampling, imported audio, remote AI, accounts, analytics, and cloud sync.

Browser smoke could not run because `npm run dev -- --host 127.0.0.1` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; the escalated localhost retry was rejected by environment policy, so no workaround was used.
