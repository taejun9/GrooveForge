# plan-109-key-compass

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a read-only Key Compass panel that makes direct composition easier by showing the current key, scale notes, chord movement, bass/melody pitch posture, and selected edit focus from local Pattern A/B/C musical event data. The panel should help beginners understand safe notes and chord context while giving experienced producers a quick harmonic scan without changing project data.

## Non-Goals

- Do not add sample import, chopping, sampler tracks, audio clips, remote AI, analytics, accounts, or cloud sync.
- Do not mutate notes, chords, patterns, arrangement, mixer, sound, master, snapshots, exports, or recommendations from the Key Compass panel.
- Do not claim music theory correctness beyond deterministic local scale/chord summaries.

## Context Map

- Product direction: `docs/product/product.md`
- Quality rules: `docs/quality/rules.md`
- Workstation key/chord helpers: `src/domain/workstation.ts`
- Current UI summary panels and note/chord editors: `src/ui/App.tsx`
- Styling: `src/styles.css`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-109-key-compass` and `.worktree/plan-109-key-compass` for git repository work.
- Keep Key Compass derived from local deterministic state only.

## Implementation Plan

- [x] Inspect current key, scale, chord, note editor, and summary-panel patterns.
- [x] Add Key Compass summary types and derivation helpers in `src/ui/App.tsx`.
- [x] Render the Key Compass panel near the composition/start surfaces with stable `data-testid` values.
- [x] Add CSS for a compact read-only harmonic panel that fits the dense workstation layout.
- [x] Update product docs, quality rules, and QA expectations.
- [x] Run QA, browser smoke, review, and completion docs before merge.

## QA Plan

- `npm run qa` passed.
- `npm run verify` passed.
- Browser smoke on `http://127.0.0.1:5182/` passed:
  - `key-compass` rendered.
  - Headline reported `F minor / Pattern A compass`.
  - Seven scale-note chips rendered.
  - Five read-only cards rendered: scale, chords, bass, melody, focus.
  - Key Compass contained 0 buttons and 0 inputs.
  - Console error count was 0.
  - Horizontal overflow was false at 1280px.

## Review Plan

QA completes before review starts. Review checks for product alignment, read-only behavior, deterministic local derivation, theory-summary honesty, sampling guardrails, and UI regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Key Compass as a read-only harmonic guide. | The next useful movement toward a producer-friendly and beginner-friendly workstation is clearer direct composition context, not sampling. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added Key Compass summary derivation, panel render, and CSS. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, and browser smoke passed. |
| 2026-06-16 | review_judge | Review found no blocking issues. |

## Completion Notes

Key Compass now gives a read-only scale/chord/bass/melody/focus pass from local key, selected Pattern A/B/C musical event data, and editor selection state. It does not mutate project data, trigger playback or exports, add sampling, or call remote services.
