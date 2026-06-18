# plan-307-session-pass-card-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Session Pass card focus commands through Quick Actions so beginners can jump to Guided, Studio, Finish, or Delivery passes and producers can inspect any session pass lane from command search without changing project data, scoring, playback, or exports.

## Non-Goals

- Do not change Session Pass derivation, First Beat Path, Review Queue, Finish Checklist, Export Preflight, project mode, project data, arrangement, mixer, master, exports, save/load, undo/redo, Handoff Pack, Handoff Sheet, or render behavior.
- Do not add auto-editing, auto-play, auto-arrangement, auto-rendering, auto-export, audio analysis, reference-track upload, tutorials, onboarding overlays, macros, command chains, hidden generation, sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `sessionPassSummary.cards`, `activeSessionPassQuickActionCard`, `focusSessionPassCard`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Session Pass and Quick Actions product behavior.
- `docs/quality/rules.md`: Session Pass and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-307-session-pass-card-quick-actions` and `.worktree/plan-307-session-pass-card-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Session Pass focus and Quick Actions result patterns.
- [x] Add one Quick Action per Session Pass card that reuses the existing focus handler.
- [x] Add local result metric/follow-up copy for direct Session Pass focus commands without mutating project data or scoring.
- [x] Update durable docs and QA expectations to keep the commands scoped to UI-local focus navigation.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Session Pass Quick Actions, confirm each command focuses the matching card without project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Session Pass direct commands derive only from existing Session Pass cards, route only to the existing focus handler, keep result feedback UI-local, preserve project data/playback/export/save/load/undo semantics, and avoid autoplay, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Session Pass focus cards. | Session pass checks bridge beginner guidance and producer session triage; direct command access improves flow without changing project data or playback. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Session Pass has visible focus controls and one current-card Quick Action, but no direct per-card commands. |
| 2026-06-18 | harness_builder | Added direct Session Pass card Quick Actions derived from `sessionPassSummary.cards`, routed them through `onFocusSessionPass`, and added focus-only result metric/follow-up handling. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations to document direct Session Pass card commands as UI-local focus navigation. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check`; `npm run verify` passed with the existing Vite 500 kB chunk warning. |
| 2026-06-18 | quality_runner | Browser smoke was not run because sandboxed localhost binding failed with `listen EPERM`, and the escalated `npm run dev -- --host 127.0.0.1 --port 5331` retry was rejected by policy. |
| 2026-06-18 | review_judge | Review found no code issues; direct commands derive from existing Session Pass cards and do not add data mutation, autoplay, export, sampling, or remote scope. |

## Completion Notes

- Direct Quick Actions now expose each Session Pass card with ids derived from `session-pass-card-${card.id}`.
- All direct card commands call the existing Session Pass focus handler and are classified as focus-only result actions.
- Durable docs and the QA harness now require direct Session Pass card commands to stay UI-local and project-data-neutral.
- Browser smoke remains a residual environment gap because the local dev server could not bind under the current sandbox and escalation policy.
