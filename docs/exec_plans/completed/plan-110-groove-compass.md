# plan-110-groove-compass

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a read-only Groove Compass panel that summarizes the selected Pattern A/B/C drum groove from local event data: density, anchors, hat motion, timing feel, probability, and repeat posture. The panel should help beginners understand whether a beat has a usable groove foundation while giving experienced producers a quick pocket scan without changing project data.

## Non-Goals

- Do not add sample import, chopping, sampler tracks, audio clips, remote AI, analytics, accounts, or cloud sync.
- Do not mutate drums, notes, chords, patterns, arrangement, mixer, sound, master, snapshots, exports, or recommendations from the Groove Compass panel.
- Do not claim genre authenticity or professional mix/master quality from rhythm summaries.

## Context Map

- Product direction: `docs/product/product.md`
- Quality rules: `docs/quality/rules.md`
- Drum event helpers: `src/domain/workstation.ts`
- Current UI summary panels and drum editor: `src/ui/App.tsx`
- Styling: `src/styles.css`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-110-groove-compass` and `.worktree/plan-110-groove-compass` for git repository work.
- Keep Groove Compass derived from local deterministic state only.

## Implementation Plan

- [x] Inspect current drum editor, Groove Feel Pads, Drum Accent Pads, Key Compass, and summary-panel patterns.
- [x] Add Groove Compass summary types and derivation helpers in `src/ui/App.tsx`.
- [x] Render the Groove Compass panel near the composition/start surfaces with stable `data-testid` values.
- [x] Add CSS for a compact read-only rhythm panel that fits the dense workstation layout.
- [x] Update product docs, quality rules, and QA expectations.
- [x] Run QA, browser smoke, review, and completion docs before merge.

## QA Plan

- Run `npm run qa`.
- Run `npm run verify`.
- Browser smoke test the local app to verify:
  - `groove-compass` renders.
  - It reports selected Pattern A/B/C drum posture.
  - It shows read-only density, anchor, hats, timing, chance, and focus cards.
  - It does not create console errors or horizontal overflow.

## Review Plan

QA completes before review starts. Review checks for product alignment, read-only behavior, deterministic local derivation, rhythm-summary honesty, sampling guardrails, and UI regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Groove Compass as a read-only rhythm guide. | The next useful movement toward a producer-friendly and beginner-friendly workstation is clearer direct drum/groove context, not sampling. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added the read-only Groove Compass panel, local drum-event summary helpers, CSS, product docs, quality rule, and harness expectations. |
| 2026-06-16 | quality_runner | Ran `npm run qa`, `npm run verify`, and browser smoke for desktop plus the 1220px responsive breakpoint. |
| 2026-06-16 | review_judge | Reviewed the diff after QA and adjusted neutral on-grid/100% chance grooves so the compass does not overstate risk. |

## Completion Notes

- Added Groove Compass as a read-only panel after Key Compass.
- Derived selected Pattern A/B/C drum density, kick/clap anchors, hat motion, timing spread, chance posture, and selected drum focus from local drum event data only.
- Updated README, product docs, quality rules, and QA harness expectations to keep the feature aligned with the all-genre direct beat workstation direction.
- QA passed: `npm run qa`, `npm run verify`.
- Browser smoke passed at `http://127.0.0.1:5182/`: 6 Groove Compass cards, no controls, no console errors, no desktop overflow; 1180px breakpoint uses 3 grid columns with no overflow.
