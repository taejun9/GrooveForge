# plan-183-master-finish-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Master Finish Preview that shows the recommended finish pad and the pre-click preset, ceiling, output gain, and change-count outcome before users apply a Master Finish, so beginners can choose a finishing posture confidently and producers can verify output changes quickly.

## Non-Goals

- Do not change Master Finish pad definitions, suggested pad selection, apply behavior, master preset semantics, master ceiling limits, master mixer gain semantics, project schema, save/load, undo/redo, playback, render/export, Mix Coach, Master Output Role, Quick Actions, Next Move, Delivery Targets, Beat Map, Handoff Pack, or Handoff Sheet behavior.
- Do not add automatic mastering, auto-apply, modal confirmations, tutorials, LUFS/true-peak/platform compliance claims, sampling, imported audio, remote AI, remote analysis, accounts, analytics, cloud sync, plugin hosting, or destructive actions.

## Context Map

- `src/ui/App.tsx`: Master Finish pad definitions/options/component, suggested finish pad, apply path, master output helpers.
- `src/styles.css`: Master Finish panel layout and responsive styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Master Finish Preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-183-master-finish-preview` and `.worktree/plan-183-master-finish-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Master Finish option derivation, rendering, docs, styles, and QA expectations.
- [x] Add a UI-local Master Finish Preview derived from current project state and existing Master Finish pad options.
- [x] Render the preview without changing pad selection, apply behavior, master state, or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Master Finish Preview renders, shows the recommended pad, preset/ceiling/output changes, updates after applying a finish pad, Master Finish buttons still work, Quick Actions and Next Move master finish paths still apply, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that the preview derives only from local project state and existing Master Finish pad options, stays UI-local, preserves all Master Finish behavior, avoids mastering/platform claims, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a read-only Master Finish Preview instead of changing pad ordering or applying a default finish. | The usability gap is understanding finish impact before clicking, not a new mastering model. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Master Finish Preview. |
| 2026-06-17 | harness_builder | Added Master Finish Preview summary, rendering, responsive styling, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Ran QA, typecheck, quality gate, verify, diff check, static dist/source token checks, and attempted Browser smoke. Browser smoke was blocked by localhost EPERM and escalated retry rejection. |
| 2026-06-17 | review_judge | Reviewed the implementation after QA and found no issues requiring code changes. |

## Completion Notes

Completed. Master Finish now includes a UI-local Preview for the suggested finish pad, showing pre-click preset, ceiling, output gain, and finish-move count. The preview derives from current local master state and existing Master Finish pad options, stays out of saved project data, and preserves Master Finish pad definitions, suggested pad selection, apply behavior, master preset semantics, master ceiling limits, master mixer gain semantics, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, Mix Coach, Master Output Role, Quick Actions, Next Move, Handoff Sheet, and Handoff Pack semantics.

Validation passed:

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- static dist/source token checks for `master-finish-preview`

Browser smoke was attempted but blocked by `listen EPERM: operation not permitted 127.0.0.1:5274`; the escalated localhost server retry was rejected by environment policy, so no browser workaround was used.
