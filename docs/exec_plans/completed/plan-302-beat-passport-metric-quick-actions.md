# plan-302-beat-passport-metric-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Beat Passport metric Focus commands through Quick Actions so beginners can jump to target, length, Pattern use, readiness, export, stems, or master identity checks and producers can inspect any beat-identity metric from command search without changing project data or starting playback.

## Non-Goals

- Do not change Beat Passport metric derivation, scoring, order, visible focus buttons, playback controls, project schema, musical events, arrangement, mixer, master, exports, save/load, undo/redo, Handoff Pack, Handoff Sheet, or render behavior.
- Do not add auto-play, auto-fixing, auto-rendering, auto-export, audio analysis, reference-track upload, tutorials, onboarding overlays, macros, command chains, hidden generation, sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `beatPassportSummary.metrics`, `onFocusBeatPassport`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Beat Passport and Quick Actions product behavior.
- `docs/quality/rules.md`: Beat Passport and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-302-beat-passport-metric-quick-actions` and `.worktree/plan-302-beat-passport-metric-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Beat Passport focus and Quick Actions result patterns.
- [x] Add one Quick Action per Beat Passport metric that reuses the existing focus handler.
- [x] Add local result metric/follow-up copy for direct Beat Passport metric commands without mutating project data or starting playback.
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
- Browser smoke if environment allows localhost: open the workstation, run direct Beat Passport Quick Actions, confirm each command focuses the matching metric/panel without project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Beat Passport direct commands derive only from existing metrics, route only to the existing focus handler, keep result feedback UI-local, preserve project data/playback/export/save/load/undo semantics, and avoid autoplay, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Beat Passport metrics. | Beat identity checks are central to beginner orientation and producer handoff review; direct command access improves navigation without playback or data mutation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Beat Passport has visible focus controls and one highest-priority Quick Action, but no direct per-metric commands. |
| 2026-06-18 | harness_builder | Added direct Beat Passport metric Quick Actions, UI-local result/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | review_judge | During review, aligned the existing `beat-passport-focus` command with focus-only result status so it reports `Focused` like the direct metric commands. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check` passed. |
| 2026-06-18 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5326` with `listen EPERM`, and the escalated localhost retry was rejected. |
| 2026-06-18 | review_judge | Reviewed the diff after QA and found no follow-up issues; commands derive from existing Beat Passport metrics and route only through the existing focus handler. |

## Completion Notes

- Added direct Quick Actions for Beat Passport target, length, Pattern use, readiness, export, stems, and master metrics.
- Commands derive from existing `beatPassportSummary.metrics`, route through `onFocusBeatPassport(metric)`, and keep result metrics/follow-up copy UI-local.
- Existing `beat-passport-focus` and direct metric commands now share focus-only result status.
- Updated README, product docs, quality rules, and harness expectations to preserve all-genre direct beat composition scope while keeping sampling, imported audio, autoplay, remote AI, accounts, analytics, and cloud sync out of scope.
- QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check`.
- Browser smoke was not completed because localhost binding failed with `listen EPERM` on `127.0.0.1:5326`, and the escalated retry was rejected.
