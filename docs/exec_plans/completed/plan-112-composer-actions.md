# plan-112-composer-actions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add explicit Composer Actions that turn the current Composer Guide state into a short set of user-clicked writing moves. Beginners should get obvious next buttons for drums, 808/bass, harmony, melody, arrangement, and finish flow; working producers should get a fast local action rail that routes to existing editable, undoable beat-making tools.

## Non-Goals

- Do not add sample import, chopping, sampler tracks, audio clips, remote AI, analytics, accounts, or cloud sync.
- Do not auto-apply changes from Composer Actions; every mutation must require an explicit button click.
- Do not bypass existing undoable project update paths or create a new hidden generation system.
- Do not claim professional songwriting, genre authenticity, commercial readiness, or automatic mastering.

## Context Map

- Product direction: `docs/product/product.md`
- Quality rules: `docs/quality/rules.md`
- Existing Next Move and command routing: `src/ui/App.tsx`
- Styling: `src/styles.css`
- Harness expectations: `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-112-composer-actions` and `.worktree/plan-112-composer-actions` for git repository work.
- Keep Composer Actions derived from local deterministic state only and routed through existing explicit handlers.

## Implementation Plan

- [x] Inspect existing Next Move command types, Quick Actions, and pad/apply handlers.
- [x] Add Composer Action summary/action types and derivation helpers in `src/ui/App.tsx`.
- [x] Render Composer Actions near Composer Guide with stable `data-testid` values and explicit buttons.
- [x] Route buttons through existing undoable handlers for beat blueprint, drum foundation, 808 bassline, chord preset, melody motif, arrangement template, Pattern Chain, and Master Finish where appropriate.
- [x] Add CSS for a compact action rail that fits the dense workstation layout.
- [x] Update product docs, quality rules, and QA expectations.
- [x] Run QA, browser smoke, review, and completion docs before merge.

## QA Plan

- Run `npm run qa`.
- Run `npm run verify`.
- Browser smoke test the local app to verify:
  - `composer-actions` renders.
  - It reports a current action focus.
  - It shows explicit local action buttons.
  - Buttons are real controls but do not run without user clicks.
  - It does not create console errors or horizontal overflow.

## Review Plan

QA completes before review starts. Review checks for product alignment, explicit-click behavior, deterministic local derivation, undoable routing, sampling guardrails, and UI regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Composer Actions as explicit local writing moves. | The next useful movement toward a pro-friendly and beginner-friendly workstation is connecting diagnosis to safe, existing beat-making actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added Composer Actions summary, action rail UI, and existing-handler routing for direct composition moves. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations to keep Composer Actions beat-composition-first. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `npm run qa`, `npm run verify`, and Browser smoke passed. |
| 2026-06-16 | review_judge | Review found no blocking issues. |

## Completion Notes

Composer Actions now appears below Composer Guide with six explicit local writing moves for drums, 808/bass, harmony, melody, arrangement, and finish flow. Actions derive from local project/render state and route through existing undoable handlers only. Sampling, imported audio, hidden generation, remote AI, analytics, accounts, and cloud sync remain out of scope.
