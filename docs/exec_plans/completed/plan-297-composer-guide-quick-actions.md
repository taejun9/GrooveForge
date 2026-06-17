# plan-297-composer-guide-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Composer Guide card Focus commands through Quick Actions so beginners can jump to the exact writing lane they need and producers can move quickly to drums, 808/bass, harmony, melody, arrangement, or finish diagnostics without changing project data.

## Non-Goals

- Do not change Composer Guide card derivation, scoring, order, focus button UI, Composer Actions, musical events, arrangement, mixer, master, delivery target, saved project schema, undo/redo, playback, save/load, or export behavior.
- Do not add tutorials, onboarding overlays, macros, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `ComposerGuide`, `composerGuideSummary.cards`, `onFocusComposerGuide`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: Composer Guide and Quick Actions product behavior.
- `docs/quality/rules.md`: Composer Guide and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-297-composer-guide-quick-actions` and `.worktree/plan-297-composer-guide-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Composer Guide focus and Quick Actions result patterns.
- [x] Add one Quick Action per Composer Guide card that reuses the existing focus handler.
- [x] Add local result metric/follow-up copy for direct Composer Guide card commands without mutating project data.
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
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions Composer Guide card commands, confirm each command focuses the matching card/panel without project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Composer Guide card commands derive only from existing guide cards, route only to the existing Composer Guide focus handler, keep result feedback UI-local, preserve project data/playback/export/save/load/undo semantics, and avoid generation, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add one Quick Action per Composer Guide card. | Direct command-palette access to writing lanes improves beginner orientation and producer navigation without new generation or data mutation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Composer Guide has visible focus buttons and one highest-priority Quick Action, but no direct card commands. |
| 2026-06-18 | harness_builder | Added direct Composer Guide card Quick Actions, UI-local result/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `npm run qa` passed. |
| 2026-06-18 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5321` with `listen EPERM`, and the escalated localhost retry was rejected. |
| 2026-06-18 | review_judge | Reviewed the diff after QA and found no follow-up issues; commands derive from existing Composer Guide cards and route only through the existing focus handler. |

## Completion Notes

- Added one direct Quick Action per Composer Guide card for Drums, 808/Bass, Harmony, Melody, Arrange, and Finish.
- Commands derive from existing `composerGuideSummary.cards`, route through `onFocusComposerGuide(card)`, and keep result metrics/follow-up copy UI-local.
- Updated README, product docs, quality rules, and harness expectations to preserve direct beat composition scope and avoid generation, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `git diff --check`, `npm run verify`, and `npm run qa`.
- Browser smoke was not completed because localhost binding failed with `listen EPERM` on `127.0.0.1:5321`, and the escalated retry was rejected.
