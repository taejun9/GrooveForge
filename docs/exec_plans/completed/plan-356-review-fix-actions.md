# plan-356-review-fix-actions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop beat workstation that can satisfy working producers while staying approachable for beginners.

## Goal

Add explicit Review Fix actions to Review Queue so users can move from the top production issue into one existing, undoable beat-making, arrangement, mix/master, delivery, or handoff action.

## Non-Goals

- Do not add automatic song critique, remote AI, audio analysis, reference-track upload, sampling, imported audio, sampler devices, accounts, analytics, payments, or cloud sync.
- Do not add multi-step macros, hidden auto-fixing, automatic playback, automatic export, batch export, or file-system automation.
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
- Keep Review Fix result state UI-local and out of saved project schema and undo history.
- Derive Review Fix options only from existing Review Queue items and current local project state.
- Route visible Fix buttons and Quick Actions only through one existing explicit handler per item:
  - Readiness composition issues: existing Layer Starter path.
  - Arrangement/structure issues: existing Pattern Chain, Chain Expand, Arrangement Template, or Arrangement Move path.
  - Target mismatch: existing Delivery Target Alignment path.
  - Mix/master issues: existing Mix Fix or Master Finish path.
  - Handoff issues: existing Session Brief Starter path.
- Preserve Review Queue focus behavior, Finish Checklist behavior, Hook/Topline fix behavior, Pattern A/B/C data except the explicitly clicked existing handler's intended edit, arrangement semantics, mixer/master semantics, save/load, playback, and exports.
- Do not implement, commit, or push feature work directly on `main`.

## Implementation Plan

- [x] Derive a Review Fix option from each Review Queue item.
- [x] Add visible Fix controls and a UI-local result strip to Review Queue.
- [x] Add Quick Actions for current and direct Review Fix commands.
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

QA completes before review starts. Review should verify Review Fix actions derive only from Review Queue items, route to one existing handler per item, keep result feedback UI-local, avoid autoplay/auto-export/hidden macro chains, and preserve project schema, sampling boundary, playback, save/load, and export behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Reuse existing single-step handlers for Review Fix actions. | Review Queue should become actionable without adding hidden generation or a separate automation layer. |
| 2026-06-18 | Treat Review Fix commands as mutating Quick Actions and keep Review Queue focus commands focus-only. | Review Fix routes to existing undoable handlers, while focus commands still only jump panels. |
| 2026-06-18 | Leave browser verification as blocked by local dev server policy after QA passed. | `npm run dev -- --host 127.0.0.1 --port 5356` failed with `listen EPERM`; escalated retry was rejected by environment policy. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-356-review-fix-actions`. |
| 2026-06-18 | harness_builder | Added Review Fix derivation, visible Fix buttons, UI-local result feedback, and current/direct Quick Actions. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations to include Review Fix without changing the sampling boundary. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-18 | review_judge | Reviewed the change after QA; no blocking findings. Browser verification remains unrun due local port binding policy. |

## Completion Notes

Completed. Review Queue now has explicit Fix buttons and command-palette Review Fix commands that derive from existing Review Queue items and route exactly one existing explicit handler per issue. Result feedback remains UI-local, Review Queue focus remains separate from mutating fixes, and no sampling, imported audio, hidden generation, autoplay, auto-export, remote AI, accounts, analytics, or cloud behavior was added.
