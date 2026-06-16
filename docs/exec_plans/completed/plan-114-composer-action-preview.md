# plan-114-composer-action-preview

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add clear Composer Action previews so users can see the action scope, edit impact, and undo posture before clicking. Beginners should understand what a button will change; producers should scan whether an action replaces a lane, adds a tail move, reshapes arrangement, or updates master posture.

## Non-Goals

- Do not add sample import, chopping, sampler tracks, audio clips, remote AI, analytics, accounts, or cloud sync.
- Do not add confirmation dialogs or block the fast action workflow.
- Do not auto-apply Composer Actions or create hidden generation.
- Do not bypass existing undoable handlers.

## Context Map

- Product direction: `docs/product/product.md`
- Quality rules: `docs/quality/rules.md`
- Composer Actions: `src/ui/App.tsx`
- Styling: `src/styles.css`
- Harness expectations: `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-114-composer-action-preview` and `.worktree/plan-114-composer-action-preview` for repository work.
- Keep all previews derived from local deterministic state and explicit command definitions.

## Implementation Plan

- [x] Inspect current Composer Actions fields, layout, and QA expectations.
- [x] Add Composer Action preview fields for scope, impact, and undo/replace posture.
- [x] Render preview metadata inside each action button without increasing layout risk.
- [x] Update docs, quality rules, and QA expectations for preview metadata.
- [x] Run QA, browser smoke, review, and completion docs before merge.

## QA Plan

- Run `npm run qa`.
- Run `npm run verify`.
- Browser smoke test the local app to verify:
  - `composer-actions` still renders.
  - Six explicit buttons still render.
  - Action buttons show scope and impact preview text.
  - Buttons remain native user-clicked controls.
  - There are no console errors or horizontal overflow at desktop and responsive widths.

## Review Plan

QA completes before review starts. Review checks for deterministic local preview text, explicit-click behavior, undoable routing, no modal friction, sampling guardrails, and UI regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add inline Composer Action previews instead of confirmations. | Preview metadata improves beginner confidence and producer speed without slowing the explicit action workflow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added scope, impact, and safety preview metadata to Composer Actions without changing command routing. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for preview metadata and sampling guardrails. |
| 2026-06-16 | quality_runner | `npm run qa` and `npm run verify` passed. Browser smoke passed at 1280px and 1180px with six action previews, no console errors, and no horizontal overflow. |
| 2026-06-16 | review_judge | Review found no blocking issues. Preview text is local, informational, explicit-click, and routed through existing undoable handlers. |

## Completion Notes

Composer Actions now show inline scope, impact, and undo posture previews for drums, 808/bass, harmony, melody, arrangement, and master finish actions. The change keeps GrooveForge centered on direct all-genre beat composition and does not add sampling, audio clips, remote AI, modal confirmations, hidden generation, or new mutation paths.

Validation completed before merge:

- `npm run qa`
- `npm run verify`
- Browser smoke at `http://127.0.0.1:5184/` for default 1280px and responsive 1180px widths.

Completion review mirror: `docs/reviews/plan-114-composer-action-preview.md`.
