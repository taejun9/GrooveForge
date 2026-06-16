# plan-189-808-move-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local 808 Move Preview inside the 808/Melody editor that shows the selected Pattern A/B/C bass note posture, suggested 808 Bassline, 808 Glide, and 808 Contour targets, plus pre-click move counts before users apply those pads. Beginners should understand what a low-end button will change, and producers should scan sub rhythm, glide, pitch direction, and chance changes quickly.

## Non-Goals

- Do not change 808 Bassline, 808 Glide, or 808 Contour definitions, ranking, apply behavior, bass note schema, selected-note edit tools, Pattern A/B/C independence, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic bass writing, hidden generation, remote AI, sampling, imported audio, plugin hosting, accounts, analytics, cloud sync, modal tutorials, or destructive actions.

## Context Map

- `src/ui/App.tsx`: 808 bassline/glide/contour option derivation, pad rendering, 808 apply paths.
- `src/styles.css`: bass pad layout and compact preview styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: 808 Move Preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-189-808-move-preview` and `.worktree/plan-189-808-move-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current 808 pad option data, docs, styles, and QA expectations.
- [x] Add a UI-local 808 Move Preview derived from current selected Pattern A/B/C bass notes and existing 808 Bassline/Glide/Contour targets.
- [x] Render the preview without changing 808 pad buttons, option definitions, apply behavior, or saved project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: 808 Move Preview renders, shows current bass posture, updates after Bassline/Glide/Contour clicks, bass pad buttons still apply through undoable paths, selected-note controls remain editable, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that the preview derives only from local key, selected Pattern A/B/C bass note data, and existing 808 Bassline/Glide/Contour option targets, stays UI-local, preserves all apply behavior, avoids hidden generation and sampling-first framing, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a read-only 808 Move Preview instead of changing 808 Bassline/Glide/Contour targets or auto-applying suggestions. | The usability gap is seeing low-end note, glide, contour, and chance changes before clicking, not changing the explicit bass editing model. |
| 2026-06-17 | Keep 808 Move Preview UI-local and derived from existing pad transform targets. | This preserves project schema, undo history, Pattern A/B/C independence, exports, and beat-first product framing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for 808 Move Preview. |
| 2026-06-17 | harness_builder | Added 808 Move Preview summary derivation, rendering, responsive CSS, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5280` with `listen EPERM`; escalated retry was rejected by environment policy, so no workaround was attempted. |
| 2026-06-17 | review_judge | Reviewed the preview path and found no schema, apply-behavior, export, playback, cloud, AI, sampling, or hidden-generation changes. |

## Completion Notes

808 Move Preview now appears before 808 Bassline/Glide/Contour Pads, summarizes the current selected Pattern 808 posture, suggests the next bassline/glide/contour posture, and shows pre-click move counts from local key, bass note, and existing pad target data only. The change keeps 808 writing explicit and sample-free while preserving all existing pad apply behavior and project data contracts.
