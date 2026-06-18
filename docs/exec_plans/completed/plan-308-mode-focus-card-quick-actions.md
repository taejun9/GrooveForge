# plan-308-mode-focus-card-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Mode Focus card jump commands through Quick Actions so beginners can jump to Guided stage, writing focus, or local check cards and producers can jump to Studio scan, issue, or handoff cards from command search without changing focus scoring, project data, playback, save/load, undo/redo, or exports.

## Non-Goals

- Do not change Mode Focus derivation, Beat Map, Composer Guide, Finish Checklist, Review Queue, Workflow Navigator, project mode, project data, arrangement, mixer, master, exports, save/load, undo/redo, Handoff Pack, Handoff Sheet, or render behavior.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, auto-save, auto-export, hidden generation, sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `modeFocusSummary.cards`, `activeModeFocusQuickActionCard`, `focusModeFocusCard`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Mode Focus and Quick Actions product behavior.
- `docs/quality/rules.md`: Mode Focus and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-308-mode-focus-card-quick-actions` and `.worktree/plan-308-mode-focus-card-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Mode Focus jump and Quick Actions result patterns.
- [x] Add one Quick Action per Mode Focus card that reuses the existing jump handler.
- [x] Add local result metric/follow-up copy for direct Mode Focus card commands without mutating project data or scoring.
- [x] Update durable docs and QA expectations to keep the commands scoped to UI-local panel navigation.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Mode Focus Quick Actions, confirm each command focuses the matching workstation panel without project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Mode Focus direct commands derive only from existing Mode Focus cards, route only to the existing focus handler, keep result feedback UI-local, preserve project data/playback/export/save/load/undo semantics, and avoid autoplay, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Mode Focus cards. | Mode Focus bridges beginner guided orientation and producer studio triage; direct command access improves navigation without changing scoring, project data, or playback. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Mode Focus has visible card jumps and one current-card Quick Action, but no direct per-card commands. |
| 2026-06-18 | harness_builder | Added direct Mode Focus card Quick Actions derived from `modeFocusSummary.cards`, routed them through `onFocusModeFocus`, and added focus-only result metric/follow-up handling. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations to document direct Mode Focus card commands as UI-local panel navigation. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check`; `npm run verify` passed with the existing Vite 500 kB chunk warning. |
| 2026-06-18 | quality_runner | Browser smoke was not run because sandboxed localhost binding failed with `listen EPERM`, and the escalated `npm run dev -- --host 127.0.0.1 --port 5332` retry was rejected by policy. |
| 2026-06-18 | review_judge | Review found no code issues; direct commands derive from existing Mode Focus cards and do not add data mutation, autoplay, export, sampling, or remote scope. |

## Completion Notes

- Direct Quick Actions now expose each visible Mode Focus card with ids derived from `mode-focus-card-${card.id}`.
- All direct card commands call the existing Mode Focus jump handler and are classified as focus-only result actions.
- Durable docs and the QA harness now require direct Mode Focus card commands to stay UI-local and project-data-neutral.
- Browser smoke remains a residual environment gap because the local dev server could not bind under the current sandbox and escalation policy.
