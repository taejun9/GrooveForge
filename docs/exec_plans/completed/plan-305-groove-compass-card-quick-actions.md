# plan-305-groove-compass-card-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Groove Compass card focus commands through Quick Actions so beginners can jump to density, anchors, hat motion, timing, chance, or selected-drum pocket checks and producers can inspect any rhythm lane from command search without changing drum editing, project data, or playback.

## Non-Goals

- Do not change Groove Compass derivation, drum editing, selected drum state, Pattern A/B/C drum data, recommendations, arrangement, mixer, master, exports, save/load, undo/redo, Handoff Pack, Handoff Sheet, or render behavior.
- Do not add auto-writing, auto-play, auto-arrangement, auto-rendering, auto-export, audio analysis, reference-track upload, tutorials, onboarding overlays, macros, command chains, hidden generation, sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `grooveCompassSummary.cards`, `activeGrooveCompassQuickActionItem`, `focusGrooveCompassItem`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Groove Compass and Quick Actions product behavior.
- `docs/quality/rules.md`: Groove Compass and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-305-groove-compass-card-quick-actions` and `.worktree/plan-305-groove-compass-card-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Groove Compass focus and Quick Actions result patterns.
- [x] Add one Quick Action per Groove Compass card that reuses the existing focus handler.
- [x] Add local result metric/follow-up copy for direct Groove Compass focus commands without mutating project data or changing drums.
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
- Browser smoke if environment allows localhost: open the workstation, run direct Groove Compass Quick Actions, confirm each command focuses the matching card without drum changes, project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Groove Compass direct commands derive only from existing Groove Compass cards, route only to the existing focus handler, keep result feedback UI-local, preserve drum/project data/playback/export/save/load/undo semantics, and avoid autoplay, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Groove Compass focus cards. | Rhythm pocket checks are core to direct beat composition; direct command access improves beginner guidance and producer scanning without changing drum data or playback. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Groove Compass has visible focus controls and one highest-priority Quick Action, but no direct per-card commands. |
| 2026-06-18 | harness_builder | Added direct Groove Compass card Quick Actions, UI-local result/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check` passed. |
| 2026-06-18 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5329` with `listen EPERM`, and the escalated localhost retry was rejected. |
| 2026-06-18 | review_judge | Reviewed the diff after QA and found no follow-up issues; commands derive from existing Groove Compass cards and route only through the existing focus handler. |

## Completion Notes

- Added direct Quick Actions for Groove Compass Density, Anchors, Hats, Timing, Chance, and selected-focus cards.
- Commands derive from existing `grooveCompassSummary.cards`, route through `onFocusGrooveCompass(item)`, and keep result metrics/follow-up copy UI-local.
- Updated README, product docs, quality rules, and harness expectations to preserve all-genre direct beat composition scope while keeping sampling, imported audio, autoplay, remote AI, accounts, analytics, and cloud sync out of scope.
- QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check`.
- Browser smoke was not completed because localhost binding failed with `listen EPERM` on `127.0.0.1:5329`, and the escalated retry was rejected.
