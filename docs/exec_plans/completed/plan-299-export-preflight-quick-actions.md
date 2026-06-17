# plan-299-export-preflight-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Export Preflight card Focus commands through Quick Actions so beginners can jump to readiness, mix/master, deliverables, or handoff risks before exporting and producers can inspect any delivery blocker from command search without changing project data or rendering files.

## Non-Goals

- Do not change Export Preflight card derivation, scoring, card order, visible focus buttons, export handlers, render/download behavior, file contents, project schema, musical events, arrangement, mixer, master, Session Brief, undo/redo, playback, save/load, Handoff Pack, or Handoff Sheet behavior.
- Do not add auto-fixing, auto-rendering, auto-export, tutorials, onboarding overlays, macros, command chains, hidden generation, auto-run, autoplay, sampling, imported audio, remote AI, platform compliance claims, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `exportPreflightSummary.cards`, `onFocusExportPreflight`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Export Preflight and Quick Actions product behavior.
- `docs/quality/rules.md`: Export Preflight focus and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-299-export-preflight-quick-actions` and `.worktree/plan-299-export-preflight-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Export Preflight focus and Quick Actions result patterns.
- [x] Add one Quick Action per Export Preflight card that reuses the existing focus handler.
- [x] Add local result metric/follow-up copy for direct Export Preflight card commands without mutating project data or rendering files.
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
- Browser smoke if environment allows localhost: open the workstation, run direct Export Preflight Quick Actions, confirm each command focuses the matching preflight card/panel without project mutation, rendering files, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Export Preflight direct commands derive only from existing preflight cards, route only to the existing focus handler, keep result feedback UI-local, preserve project data/playback/export/save/load/undo semantics, and avoid auto-fixing, auto-export, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Export Preflight cards. | Delivery risk is a core beginner/pro workflow; direct command access improves export readiness triage without triggering renders or changing data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Export Preflight has visible focus buttons and one highest-priority Quick Action, but no direct per-card commands. |
| 2026-06-18 | harness_builder | Added direct Export Preflight card Quick Actions, UI-local result/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `npm run qa` passed. |
| 2026-06-18 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5323` with `listen EPERM`, and the escalated localhost retry was rejected. |
| 2026-06-18 | review_judge | Reviewed the diff after QA and found no follow-up issues; commands derive from existing Export Preflight cards and route only through the existing focus handler. |

## Completion Notes

- Added direct Quick Actions for Export Preflight Readiness, Mix / Master, Deliverables, and Handoff cards.
- Commands derive from existing `exportPreflightSummary.cards`, route through `onFocusExportPreflight(card)`, and keep result metrics/follow-up copy UI-local.
- Updated README, product docs, quality rules, and harness expectations to preserve delivery-risk triage scope and avoid rendering files, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `git diff --check`, `npm run verify`, and `npm run qa`.
- Browser smoke was not completed because localhost binding failed with `listen EPERM` on `127.0.0.1:5323`, and the escalated retry was rejected.
