# plan-117-next-move-result

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a compact result strip to Next Move actions so users can see what the explicit recommendation changed, what local beat metric moved, where to audition next, and what to check afterward. This should make guided workflow actions more trustworthy for beginners and faster to judge for working producers.

## Non-Goals

- Do not add sample import, chopping, sampler tracks, audio clips, remote AI, analytics, accounts, or cloud sync.
- Do not auto-play, auto-save, auto-export, or add modal confirmations.
- Do not persist Next Move result feedback into project data.
- Do not change the meaning of existing Next Move recommendations.
- Do not bypass existing undoable action handlers.

## Context Map

- Next Move UI/actions: `src/ui/App.tsx`
- Composer Action result precedent: `src/ui/App.tsx`
- Styling: `src/styles.css`
- Product direction: `docs/product/product.md`
- Quality rules: `docs/quality/rules.md`
- QA harness: `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-117-next-move-result` and `.worktree/plan-117-next-move-result`.
- Result feedback must be derived from local state before/after the clicked action and remain informational.

## Implementation Plan

- [x] Inspect current Next Move action flow and Composer Action result pattern.
- [x] Add local UI state for the latest Next Move action result.
- [x] Derive result metric, audition cue, and next-check text from local post-action project state.
- [x] Render the result strip without breaking desktop or responsive layout.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, browser smoke, review, and completion docs before merge.

## QA Plan

- Run `npm run qa`.
- Run `npm run verify`.
- Browser smoke test the local app to verify:
  - Next Move still renders one primary action and secondary actions.
  - Clicking a Next Move action shows a result strip.
  - The strip shows the action title, local metric, audition cue, and next check.
  - The result strip remains UI-only and does not trigger playback or export.
  - There are no console errors or horizontal overflow at desktop and responsive widths.

## Review Plan

QA completes before review starts. Review checks local result derivation, explicit-click behavior, undoable routing, no persistent UI-only state, sampling guardrails, export/playback boundaries, and UI regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add result feedback to Next Move rather than adding another guidance panel. | Next Move is already the main workflow action strip; result feedback there improves trust and speed without adding a new surface. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | repo_cartographer | Added UI-only Next Move result state, rendering, and local before/after metric derivation. |
| 2026-06-16 | harness_builder | Updated README, product docs, quality rules, and QA expectations for post-click Next Move result feedback. |
| 2026-06-16 | quality_runner | Ran `npm run qa`, `npm run typecheck`, `npm run verify`, and Browser smoke at 1280px and 1180px. |
| 2026-06-16 | review_judge | Reviewed explicit-click behavior, local-state derivation, UI-only result state, no autoplay/export trigger, and sampling guardrails. |

## Completion Notes

Next Move now shows a compact UI-only result strip after explicit recommendation clicks. The strip reports action status, one local before/after metric, an audition cue, and a next check. It clears on other project edits and does not persist into project files.

Validation passed:

- `npm run qa`
- `npm run typecheck`
- `npm run verify`
- Browser smoke at 1280px: Next Move rendered four actions, `Mix Check` produced a checked result strip, `Drum Fill` produced an applied result strip with metric movement, no console errors, and no horizontal overflow.
- Browser smoke at 1180px: result strip and follow-up cues collapsed to one column, no console errors, and no horizontal overflow.
