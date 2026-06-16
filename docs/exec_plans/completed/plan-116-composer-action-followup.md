# plan-116-composer-action-followup

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add follow-up cues to the Composer Action result strip so users know how to audition the changed layer and what to check next. Beginners should get a concrete listening target after pressing a writing button; producers should get a compact verification cue that speeds up judging pocket, hook, form, and finish decisions.

## Non-Goals

- Do not add sample import, chopping, sampler tracks, audio clips, remote AI, analytics, accounts, or cloud sync.
- Do not auto-play, auto-apply, or trigger exports from follow-up cues.
- Do not add modal confirmations or slow down the explicit action workflow.
- Do not replace or bypass existing undoable action handlers.
- Do not persist follow-up cues into project data.

## Context Map

- Product direction: `docs/product/product.md`
- Quality rules: `docs/quality/rules.md`
- Composer Action result strip: `src/ui/App.tsx`
- Styling: `src/styles.css`
- Harness expectations: `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-116-composer-action-followup` and `.worktree/plan-116-composer-action-followup`.
- Follow-up cues must be derived from local state/action definitions and remain informational.

## Implementation Plan

- [x] Inspect current Composer Action result strip and QA expectations.
- [x] Add local audition cue and next-check fields to Composer Action results.
- [x] Render the cues compactly without breaking responsive Composer Action layout.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, browser smoke, review, and completion docs before merge.

## QA Plan

- Run `npm run qa`.
- Run `npm run verify`.
- Browser smoke test the local app to verify:
  - `composer-actions` still renders.
  - Six explicit Composer Action buttons and previews still render.
  - Clicking a Composer Action shows the result strip.
  - The result strip shows action label, scope, impact, undo posture, updated metrics, audition cue, and next check.
  - Cues remain informational and do not trigger playback/export.
  - There are no console errors or horizontal overflow at desktop and responsive widths.

## Review Plan

QA completes before review starts. Review checks local deterministic cue text, explicit-click behavior, undoable routing, no persistent UI-only state in project data, sampling guardrails, and UI regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add follow-up cues to Composer Action results instead of another recommendation surface. | The result strip is where users already look immediately after a writing move; keeping the cue there improves beginner guidance and producer verification without adding panel sprawl. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | repo_cartographer | Added UI-only Composer Action audition cues and next checks derived from local action/project state. |
| 2026-06-16 | harness_builder | Updated README, product docs, quality rules, and QA expectations for follow-up cue behavior and sampling guardrails. |
| 2026-06-16 | quality_runner | Ran `npm run qa`, `npm run typecheck`, `npm run verify`, and Browser smoke at 1280px and 1180px. |
| 2026-06-16 | review_judge | Reviewed local-state derivation, explicit-click behavior, UI-only result state, layout, and no sampling-first drift. |

## Completion Notes

Composer Action results now include compact audition cues and next checks after explicit writing actions. The cues are derived from the selected action and local project state, remain UI-only, and do not trigger playback, exports, hidden generation, or project persistence.

Validation passed:

- `npm run qa`
- `npm run typecheck`
- `npm run verify`
- Browser smoke at 1280px: six Composer Action buttons, six previews, no initial result strip, 808 Bassline result with metrics, audition cue, next check, no console errors, and no horizontal overflow.
- Browser smoke at 1180px: six Composer Action buttons, six previews, result follow-up collapsed to one column, Composer Action grid stayed at three columns, no console errors, and no horizontal overflow.
