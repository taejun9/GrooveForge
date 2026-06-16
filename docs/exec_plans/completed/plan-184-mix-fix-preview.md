# plan-184-mix-fix-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Mix Fix Preview inside Mix Coach that shows the suggested explicit fix, scope, current issue detail, and pre-click move count before users apply a Headroom, Stem Balance, or Low End fix, so beginners understand what a fix will touch and producers can verify mix intervention quickly.

## Non-Goals

- Do not change Mix Coach thresholds, Mix Fix action order, Mix Fix apply behavior, mixer/master semantics, stem analysis, export analysis, project schema, save/load, undo/redo, playback, render/export, Master Finish, Master Output Role, Quick Actions, Next Move, Handoff Pack, or Handoff Sheet behavior.
- Do not add automatic fixing, auto-apply, modal confirmations, tutorials, LUFS/true-peak/platform compliance claims, sampling, imported audio, remote AI, remote analysis, accounts, analytics, cloud sync, plugin hosting, or destructive actions.

## Context Map

- `src/ui/App.tsx`: Mix Coach component, Mix Fix actions, Mix Fix apply path, mixer/master comparison helpers.
- `src/styles.css`: Mix Coach and Mix Fix layout.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Mix Fix Preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-184-mix-fix-preview` and `.worktree/plan-184-mix-fix-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Mix Coach, Mix Fix actions, docs, styles, and QA expectations.
- [x] Add a UI-local Mix Fix Preview derived from current project state, export analysis, stem analyses, and existing Mix Fix actions.
- [x] Render the preview without changing Mix Fix buttons, action order, apply behavior, or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Mix Fix Preview renders, shows a suggested fix or clear state, updates after Mix Fix clicks, Mix Fix buttons still apply through undoable paths, Mix Coach focus still works, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that the preview derives only from local project/render/stem state and existing Mix Fix actions, stays UI-local, preserves all Mix Fix behavior, avoids mastering/platform claims, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a read-only Mix Fix Preview instead of changing fix priority or applying fixes automatically. | The usability gap is understanding fix scope before clicking, not changing the mix intervention model. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Mix Fix Preview. |
| 2026-06-17 | harness_builder | Added Mix Fix Preview summary, rendering, responsive styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Ran QA, typecheck, quality gate, verify, diff check, static dist/source token checks, and attempted Browser smoke. Browser smoke was blocked by localhost EPERM and escalated retry rejection. |
| 2026-06-17 | review_judge | Reviewed the implementation after QA and found no issues requiring code changes. |

## Completion Notes

Completed. Mix Coach now includes a UI-local Mix Fix Preview showing the suggested explicit fix, scope, issue detail, and pre-click move count before Headroom, Stem Balance, or Low End fixes are applied. The preview derives from current local project state, deterministic export analysis, deterministic stem analysis, and existing Mix Fix actions, stays out of saved project data, and preserves Mix Coach thresholds, Mix Fix action order, Mix Fix apply behavior, mixer/master semantics, stem analysis, export analysis, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, Master Finish, Master Output Role, Quick Actions, Next Move, Handoff Sheet, and Handoff Pack semantics.

Validation passed:

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- static dist/source token checks for `mix-fix-preview`

Browser smoke was attempted but blocked by `listen EPERM: operation not permitted 127.0.0.1:5275`; the escalated localhost server retry was rejected by environment policy, so no browser workaround was used.
