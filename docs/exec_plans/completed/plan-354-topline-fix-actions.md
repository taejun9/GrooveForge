# plan-354-topline-fix-actions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop beat workstation that satisfies working producers while staying approachable for beginners.

## Goal

Add explicit Topline Fix actions to Topline Space so users can move from a crowded vocal/topline diagnosis into one existing, undoable beat-making action. Each action should map the active Topline Space card to a local direct-composition, arrangement, mix/master, or brief-context move while keeping the user in control.

## Non-Goals

- Do not add vocal recording, lyric generation, reference-track upload, audio analysis, stem separation, sampling, imported audio, remote AI, accounts, analytics, payments, or cloud sync.
- Do not add hidden auto-writing, automatic playback, automatic export, macro chains, or multi-step command automation.
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
- Keep Topline Fix result state UI-local and out of saved project schema and undo history.
- Derive Topline Fix targets only from existing Topline Space cards and local project state.
- Route visible Fix buttons and Quick Actions only through one existing explicit handler per card:
  - Pocket: existing Groove Feel path.
  - Lead Room: existing Pattern Fill Clear Tail path.
  - Vocal Window: existing Pattern Chain or arrangement template path.
  - Headroom: existing Mix Fix path.
  - Artist Cue: existing Session Brief Starter path.
- Preserve Topline Space focus/cue behavior, Hook Loop cue, Pattern A/B/C data except the explicitly clicked existing handler's intended edit, arrangement semantics, mixer/master semantics, save/load, playback, and exports.
- Do not implement, commit, or push feature work directly on `main`.

## Implementation Plan

- [x] Derive a Topline Fix option from the active Topline Space card.
- [x] Add visible Fix controls to Topline Space cards that call exactly one existing handler for the selected card.
- [x] Add Quick Actions for current and direct Topline Fix commands.
- [x] Add UI-local Topline Fix result feedback with before/after metric, audition cue, and next check.
- [x] Update docs, quality rules, and harness expectations.
- [x] Run QA, review, move plan to completed, and create review mirror.

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

QA completes before review starts. Review should verify Topline Fix actions derive only from Topline Space cards, route to one existing handler per card, keep result feedback UI-local, avoid autoplay/auto-export/hidden macro chains, and preserve project schema, sampling boundary, playback, save/load, and export behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Reuse existing single-step handlers for Topline Fix actions. | The feature should help users act on a vocal-space diagnosis without adding hidden generation, new schema, or a separate automation layer. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-354-topline-fix-actions`. |
| 2026-06-18 | harness_builder | Added Topline Fix buttons, current/card Quick Actions, UI-local Topline Fix result feedback, docs, quality rules, and harness expectations. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-18 | quality_runner | Browser visual verification was attempted but blocked by sandbox dev-server binding restrictions and rejected escalated dev-server execution. |
| 2026-06-18 | review_judge | Review found no code changes required; residual risk is limited to deferred live browser screenshot verification and the existing Vite large chunk warning. |

## Completion Notes

Topline Fix actions are implemented as explicit user-triggered controls on Topline Space cards and Quick Actions. Each card maps to one existing handler: Pocket uses Pocket Groove Feel, Lead Room uses Clear Tail Pattern Fill, Vocal Window uses 8 Bar Pattern Chain, Headroom uses Headroom Mix Fix, and Artist Cue uses the Vocal Session Brief Starter. Result feedback stays UI-local, before/after Topline Space metrics are informational, and no vocal recording, reference upload, sampling, remote AI, autoplay, auto-export, project schema change, or hidden macro chain was added. QA and review completed; live browser visual verification remains deferred because the environment blocked local dev-server browser routes.
