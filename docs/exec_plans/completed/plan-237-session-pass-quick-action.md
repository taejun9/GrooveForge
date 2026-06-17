# plan-237-session-pass-quick-action

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Complete GrooveForge as a desktop app that can satisfy working producers while remaining easy for first-time composers. Keep direct beat composition central and sampling secondary.

## Goal

Add a Quick Actions command that focuses the current Session Pass card, so beginners can jump to the next guided/studio pass target and experienced producers can triage the session from the command palette without hunting through the dense workstation.

## Non-Goals

- Do not add onboarding overlays, tutorials, command chains, macros, autoplay, auto-save, auto-export, or hidden generation.
- Do not change Session Pass card scoring, Workflow Navigator scoring, project schema, playback, audio rendering, WAV/stem/MIDI export, Handoff behavior, sampling, imported audio, remote AI, plugin hosting, accounts, analytics, or cloud sync.
- Do not change Quick Actions filtering/search semantics outside adding the new command.

## Context Map

- `src/ui/App.tsx`: Session Pass focus behavior, Quick Actions definitions, Quick Action result strip.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: product feature definition.
- `docs/quality/rules.md`: Quick Actions and Session Pass guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-237-session-pass-quick-action` and `.worktree/plan-237-session-pass-quick-action` for git repository work.

## Implementation Plan

- [x] Route a new Quick Actions command to the same explicit Session Pass focus path used by the existing card buttons.
- [x] Keep the command UI-local and read-only over project data.
- [x] Show an appropriate Quick Action result metric/follow-up for the focused Session Pass target.
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

QA completes before review starts. Review checks that the new command derives only from the current Session Pass summary, routes to existing focus behavior, stays UI-local, does not mutate project data, preserves Quick Actions search/filter/result semantics, and does not touch playback, render/export, schema, sampling, or remote/cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a Session Pass Quick Action instead of a new onboarding surface. | The app already has dense guidance surfaces; command-palette access improves beginner/pro speed without adding tutorial UI or hidden automation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Selected Session Pass Quick Action as the next user-goal-aligned increment. |
| 2026-06-17 | harness_builder | Added `session-pass-focus` Quick Action using the existing `focusSessionPassCard` path, plus Focused result metric/follow-up copy. |
| 2026-06-17 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for Session Pass command-palette access. |
| 2026-06-17 | quality_runner | QA passed: run_qa, diff-check, typecheck, npm qa, quality gate, build, and verify. Browser smoke was attempted but localhost dev server binding failed with `listen EPERM`, and the escalated retry was rejected by environment policy. |
| 2026-06-17 | review_judge | Reviewed reuse of existing Session Pass focus path, read-only Quick Actions result handling, search/filter scope preservation, no scoring mutation, and no schema/playback/export/sampling/remote scope changes. |

## Completion Notes

Implemented a `session-pass-focus` Quick Action that selects the current guided/studio Session Pass card and routes it through the existing `focusSessionPassCard` path. The command appears under Project scope, closes the command palette like other commands, scrolls to the existing target panel, updates project status, and reports a UI-only `Focused` Quick Action result with Session Pass metric/follow-up text.

The change preserves Session Pass scoring, Workflow Navigator scoring, Quick Actions search/filter behavior, project data, undo history, playback, audio rendering, WAV/stem/MIDI export, Handoff behavior, sampling, imported audio, remote AI, accounts, analytics, and cloud sync.

Browser smoke could not run because `npm run dev -- --host 127.0.0.1` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; the escalated localhost retry was rejected by environment policy, so no workaround was used.
