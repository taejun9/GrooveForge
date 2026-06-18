# plan-355-hook-fix-actions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop beat workstation that satisfies working producers while staying approachable for beginners.

## Goal

Add explicit Hook Fix actions to Hook Readiness so users can move from a weak hook diagnosis into one existing, undoable beat-making action. Each action should map the active Hook Readiness card to a local direct-composition, arrangement, mix/master, or brief-context move while keeping the user in control.

## Non-Goals

- Do not add hook auto-writing, lyric generation, vocal recording, reference-track upload, audio analysis, stem separation, sampling, imported audio, remote AI, accounts, analytics, payments, or cloud sync.
- Do not add hidden auto-arrangement, automatic playback, automatic export, macro chains, or multi-step command automation.
- Do not change project schema, save/load migration, render/export semantics, playback scheduling, or style profile definitions.

## Context Map

- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Keep Hook Fix result state UI-local and out of saved project schema and undo history.
- Derive Hook Fix targets only from existing Hook Readiness cards and local project state.
- Route visible Fix buttons and Quick Actions only through one existing explicit handler per card:
  - Section: existing Pattern Chain path.
  - Motif: existing Pattern Variation path.
  - Contrast: existing Arrangement Move path.
  - Mix Support: existing Mix Fix path.
  - Handoff: existing Session Brief Starter path.
- Preserve Hook Readiness focus/cue behavior, Topline Space focus/cue/fix behavior, Pattern A/B/C data except the explicitly clicked existing handler's intended edit, arrangement semantics, mixer/master semantics, save/load, playback, and exports.
- Do not implement, commit, or push feature work directly on `main`.

## Implementation Plan

- [x] Derive a Hook Fix option from the active Hook Readiness card.
- [x] Add visible Fix controls to Hook Readiness cards that call exactly one existing handler for the selected card.
- [x] Add Quick Actions for current and direct Hook Fix commands.
- [x] Add UI-local Hook Fix result feedback with before/after metric, audition cue, and next check.
- [x] Update docs, quality rules, and harness expectations.
- [x] Run QA and review.
- [x] Move plan to completed and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify Hook Fix actions derive only from Hook Readiness cards, route to one existing handler per card, keep result feedback UI-local, avoid autoplay/auto-export/hidden macro chains, and preserve project schema, sampling boundary, playback, save/load, and export behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Reuse existing single-step handlers for Hook Fix actions. | The feature should help users act on hook diagnosis without adding hidden generation, new schema, or a separate automation layer. |
| 2026-06-18 | Map Hook Fix cards to existing `eight_bar`, `hook`, `hook_lift`, `headroom`, and `vocal` commands. | Keeps the action set sample-free, direct-composition-first, undoable through existing project update paths, and easy to explain in Quick Actions. |
| 2026-06-18 | Record browser verification as blocked by local server policy. | Vite dev server failed with `listen EPERM`, and the escalated retry was rejected by environment policy. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-355-hook-fix-actions`. |
| 2026-06-18 | harness_builder | Added Hook Fix button/result UI, current and card-level Quick Actions, docs, CSS, and QA token coverage. |
| 2026-06-18 | quality_runner | Ran `run_qa`, `run_quality_gate`, `harness:smoke`, `typecheck`, `build`, `qa`, `verify`, and `git diff --check`; all passed with the known Vite large-chunk warning during build. |
| 2026-06-18 | quality_runner | Attempted browser verification via Vite dev server on `127.0.0.1:5355`; sandbox returned `listen EPERM`, and the escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Reviewed the implementation after QA; no blocking findings. |

## Completion Notes

Implemented Hook Fix actions for Hook Readiness cards, including visible card buttons, current/direct Quick Actions, UI-local result feedback, docs/quality/harness updates, and post-QA review. Browser verification remains a residual risk because the environment rejected local dev server binding.
