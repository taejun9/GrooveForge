# plan-303-style-inspector-focus-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Style Inspector focus commands through Quick Actions so beginners can jump to BPM, swing, bass, melody, sound, or Pattern A/B/C density checks and producers can inspect any genre-fit lane from command search without changing style selection, project data, or playback.

## Non-Goals

- Do not change Style Inspector derivation, style profiles, Style Quick Picks, style selection, Beat Blueprint behavior, Pattern A/B/C event generation, arrangement, mixer, master, exports, save/load, undo/redo, Handoff Pack, Handoff Sheet, or render behavior.
- Do not add auto-applying styles, auto-play, auto-arrangement, auto-rendering, auto-export, audio analysis, reference-track upload, tutorials, onboarding overlays, macros, command chains, hidden generation, sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `styleInspectorSummary.metrics`, `styleInspectorSummary.patternDensity`, `focusStyleInspectorItem`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Style Inspector and Quick Actions product behavior.
- `docs/quality/rules.md`: Style Inspector and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-303-style-inspector-focus-quick-actions` and `.worktree/plan-303-style-inspector-focus-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Style Inspector focus and Quick Actions result patterns.
- [x] Add one Quick Action per Style Inspector metric and density row that reuses the existing focus handler.
- [x] Add local result metric/follow-up copy for direct Style Inspector focus commands without mutating project data or changing style.
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
- Browser smoke if environment allows localhost: open the workstation, run direct Style Inspector Quick Actions, confirm each command focuses the matching metric/panel without style changes, project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Style Inspector direct commands derive only from existing metrics/density rows, route only to the existing focus handler, keep result feedback UI-local, preserve style selection/project data/playback/export/save/load/undo semantics, and avoid autoplay, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Style Inspector focus lanes. | Genre-fit checks are core to all-genre beat creation; direct command access improves beginner guidance and producer scanning without changing style data or playback. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Style Inspector has visible focus controls and one highest-priority Quick Action, but no direct per-lane commands. |
| 2026-06-18 | harness_builder | Added direct Style Inspector metric and Pattern density Quick Actions, UI-local result/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | review_judge | During review, aligned the existing `style-inspector-focus` command with focus-only result status so it reports `Focused` like the direct lane commands. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check` passed. |
| 2026-06-18 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5327` with `listen EPERM`, and the escalated localhost retry was rejected. |
| 2026-06-18 | review_judge | Reviewed the diff after QA and found no follow-up issues; commands derive from existing Style Inspector metrics/density rows and route only through the existing focus handler. |

## Completion Notes

- Added direct Quick Actions for Style Inspector BPM, swing, bass, melody, sound, and Pattern A/B/C density lanes.
- Commands derive from existing `styleInspectorSummary.metrics` and `styleInspectorSummary.patterns`, route through `onFocusStyleInspector(item)`, and keep result metrics/follow-up copy UI-local.
- Existing `style-inspector-focus` and direct lane commands now share focus-only result status.
- Updated README, product docs, quality rules, and harness expectations to preserve all-genre direct beat composition scope while keeping sampling, imported audio, autoplay, remote AI, accounts, analytics, and cloud sync out of scope.
- QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check`.
- Browser smoke was not completed because localhost binding failed with `listen EPERM` on `127.0.0.1:5327`, and the escalated retry was rejected.
