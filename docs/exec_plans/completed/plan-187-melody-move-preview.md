# plan-187-melody-move-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Melody Move Preview inside the Synth/Melody lane that shows the suggested motif, accent posture, contour target, and pre-click move counts before users apply Melody Motif, Melody Accent, or Melody Contour Pads, so beginners understand melodic phrase changes and producers can verify top-line direction quickly.

## Non-Goals

- Do not change Melody Motif, Melody Accent, or Melody Contour definitions, ranking, apply behavior, melody note schema, selected-note editing tools, Pattern A/B/C independence, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic melody writing, hidden generation, remote AI, sampling, imported audio, plugin hosting, accounts, analytics, cloud sync, modal tutorials, or destructive actions.

## Context Map

- `src/ui/App.tsx`: melody motif/accent/contour option derivation, pad rendering, melody apply paths.
- `src/styles.css`: Melody pad layout.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Melody Move Preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-187-melody-move-preview` and `.worktree/plan-187-melody-move-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current melody pad option data, docs, styles, and QA expectations.
- [x] Add a UI-local Melody Move Preview derived from current melody notes and existing motif/accent/contour options.
- [x] Render the preview without changing melody pad buttons, option definitions, apply behavior, or saved project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Melody Move Preview renders, shows phrase state or empty-state guidance, updates after melody motif/accent/contour clicks, melody pad buttons still apply through undoable paths, manual melody controls remain editable, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that the preview derives only from local key, current Pattern A/B/C melody notes, and existing motif/accent/contour option targets, stays UI-local, preserves all apply behavior, avoids hidden generation and sampling-first framing, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a read-only Melody Move Preview instead of changing melody pad targets or applying suggested moves automatically. | The usability gap is understanding motif, accent, and contour changes before clicking, not changing the melody editing model. |
| 2026-06-17 | Keep Melody Move Preview UI-local and derived from existing motif/accent/contour targets. | This preserves project schema, undo history, Pattern A/B/C independence, exports, and beat-first product framing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Melody Move Preview. |
| 2026-06-17 | harness_builder | Added Melody Move Preview summary derivation, rendering, responsive CSS, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5278` with `listen EPERM`; escalated retry was rejected by environment policy, so no workaround was attempted. |
| 2026-06-17 | review_judge | Reviewed the preview path and found no schema, apply-behavior, export, playback, cloud, AI, sampling, or hidden-generation changes. |

## Completion Notes

Melody Move Preview now appears before Melody Motif/Accent/Contour Pads, summarizes the current Synth phrase, suggests the next motif/accent/contour posture, and shows pre-click move counts from current local key, selected Pattern melody notes, and existing option targets only. The change keeps melody editing explicit and sample-free while preserving all existing pad apply behavior and project data contracts.
