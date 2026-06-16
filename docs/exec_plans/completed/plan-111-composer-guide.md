# plan-111-composer-guide

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a read-only Composer Guide panel that translates the current beat into clear composition-stage guidance. It should help beginners see what to write next while giving working producers a quick scan of drum, 808/bass, harmony, melody, arrangement, and finish posture from local project data.

## Non-Goals

- Do not add sample import, chopping, sampler tracks, audio clips, remote AI, analytics, accounts, or cloud sync.
- Do not mutate drums, notes, chords, patterns, arrangement, mixer, sound, master, snapshots, exports, or recommendations from the Composer Guide panel.
- Do not claim professional songwriting, genre authenticity, commercial readiness, or automatic mastering.

## Context Map

- Product direction: `docs/product/product.md`
- Quality rules: `docs/quality/rules.md`
- Existing top summary panels: `src/ui/App.tsx`
- Styling: `src/styles.css`
- Harness expectations: `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-111-composer-guide` and `.worktree/plan-111-composer-guide` for git repository work.
- Keep Composer Guide derived from local deterministic state only.

## Implementation Plan

- [x] Inspect existing Beat Map, Next Move, Key Compass, Groove Compass, and summary-panel patterns.
- [x] Add Composer Guide summary types and derivation helpers in `src/ui/App.tsx`.
- [x] Render the Composer Guide panel near the composition overview surfaces with stable `data-testid` values.
- [x] Add CSS for a compact read-only guide that fits the dense workstation layout.
- [x] Update product docs, quality rules, and QA expectations.
- [x] Run QA, browser smoke, review, and completion docs before merge.

## QA Plan

- Run `npm run qa`.
- Run `npm run verify`.
- Browser smoke test the local app to verify:
  - `composer-guide` renders.
  - It reports a current composition focus.
  - It shows read-only drums, 808/bass, harmony, melody, arrangement, and finish cards.
  - It does not create console errors or horizontal overflow.

## Review Plan

QA completes before review starts. Review checks for product alignment, read-only behavior, deterministic local derivation, beginner/pro usefulness, sampling guardrails, and UI regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Composer Guide as a read-only composition-stage panel. | The next useful movement toward a pro-friendly and beginner-friendly workstation is clearer direct composition guidance, not sampling. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added read-only Composer Guide UI, local project summary helpers, CSS, product docs, quality rule, and harness expectations. |
| 2026-06-16 | quality_runner | Ran `npm run qa`, `npm run verify`, and browser smoke for desktop plus the 1220px responsive breakpoint. |
| 2026-06-16 | review_judge | Reviewed the diff after QA; no blocking findings. |

## Completion Notes

- Added Composer Guide as a read-only panel after Groove Compass.
- Derived drums, 808/bass, harmony, melody, arrangement, and finish posture from local selected Pattern A/B/C data, arrangement, Delivery Target, Beat Readiness, export analysis, and stem analysis.
- Updated README, product docs, quality rules, and QA harness expectations to keep the feature aligned with the all-genre direct beat workstation direction.
- QA passed: `npm run qa`, `npm run verify`.
- Browser smoke passed at `http://127.0.0.1:5182/`: 6 Composer Guide cards, no controls, no console errors, no desktop overflow; 1180px breakpoint uses 3 grid columns with no overflow.
