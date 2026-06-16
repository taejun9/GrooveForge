# plan-120-mode-focus-strip

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Make the existing Guided/Studio project mode more meaningful by adding a compact read-only Mode Focus strip. Guided mode should surface beginner-friendly current stage, next writing focus, and one local check. Studio mode should surface producer-facing session scan, highest-priority review item, and handoff/export posture. The strip must be derived from existing local project analysis and should not mutate project data or introduce a new workflow.

## Non-Goals

- Do not add sampling, imported audio, sampler tracks, audio clips, plugin hosting, remote AI, analytics, accounts, or cloud sync.
- Do not add autoplay, auto-save, auto-export, macros, or hidden generation.
- Do not persist Mode Focus output into project files.
- Do not change Guided/Studio save/load semantics or hide existing editing controls.
- Do not remove existing Beat Map, Composer Guide, Review Queue, Finish Checklist, or Next Move surfaces.

## Context Map

- Mode state and top-level render: `src/ui/App.tsx`
- Existing local summaries: Composer Guide, Beat Map, Review Queue, Finish Checklist, Handoff Pack helpers in `src/ui/App.tsx`
- Styling: `src/styles.css`
- Product docs: `README.md`, `docs/product/product.md`
- Quality rules and static harness: `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-120-mode-focus-strip` and `.worktree/plan-120-mode-focus-strip`.
- Mode Focus must remain read-only, local, deterministic, and informational.

## Implementation Plan

- [x] Inspect existing mode row and summary helper patterns.
- [x] Add Mode Focus types, summary helper, and read-only component.
- [x] Render Mode Focus near the mode row without creating layout overflow.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, verify, and browser smoke for Guided and Studio modes.
- [x] Complete review docs, merge to main, push, and clean up the branch/worktree.

## QA Plan

- `npm run qa`
- `npm run verify`
- Browser smoke:
  - Mode Focus appears in default Guided mode.
  - Switching to Studio updates the Mode Focus headline/cards without mutating project musical data.
  - Mode Focus has three compact cards with local status/detail values.
  - No console errors or horizontal overflow at desktop and responsive widths.

## Review Plan

QA completes before review starts. Review checks read-only local derivation, useful beginner/pro mode differentiation, no hidden automation, no project persistence, no sampling-first drift, and layout regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add read-only Mode Focus instead of changing editing controls by mode. | Guided and Studio should help different users orient quickly without hiding controls from pros or surprising beginners with different behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-120 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Merged latest `main` into the plan worktree after plan-121 changed shared docs/QA boundaries. |
| 2026-06-16 | harness_builder | Added Mode Focus types, helper, component, mode button test IDs, CSS, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `npm run typecheck` passed. |
| 2026-06-16 | quality_runner | `npm run qa` passed after aligning static expectations with runtime data-testid generation. |
| 2026-06-16 | quality_runner | Browser smoke passed for Guided Focus, Studio Focus, three-card layout, 1280px/1180px no horizontal overflow, and zero console errors. |
| 2026-06-16 | quality_runner | `npm run verify` passed. |
| 2026-06-16 | review_judge | Reviewed the feature for read-only local derivation, mode differentiation, no hidden automation, and sampling guardrails. |

## Completion Notes

Completed. Mode Focus now gives Guided users a compact current-stage, writing-focus, and local-check orientation, while Studio users get a session scan, top review issue, and handoff posture. The strip derives only from existing local Composer Guide, Beat Map, Review Queue, and Finish Checklist summaries, stays out of project persistence, and preserves existing controls, playback, export, and sampling boundaries.
