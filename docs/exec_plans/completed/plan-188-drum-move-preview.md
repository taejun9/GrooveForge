# plan-188-drum-move-preview

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Drum Move Preview inside the Drums pattern editor that shows the selected Pattern A/B/C drum hit posture, suggested Drum Foundation, Groove Feel, and Drum Accent targets, plus pre-click move counts before users apply those pads. Beginners should understand what a rhythm button will change, and producers should scan kick/clap/hat pocket, timing, chance, and velocity changes quickly.

## Non-Goals

- Do not change Drum Foundation, Groove Feel, or Drum Accent definitions, ranking, apply behavior, drum event schema, selected-drum edit tools, Pattern A/B/C independence, save/load, snapshots, undo/redo, playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic drum writing, hidden generation, remote AI, sampling, imported audio, plugin hosting, accounts, analytics, cloud sync, modal tutorials, or destructive actions.

## Context Map

- `src/ui/App.tsx`: drum foundation/groove/accent option derivation, pad rendering, drum apply paths.
- `src/styles.css`: drum pad layout and compact preview styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Drum Move Preview guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-188-drum-move-preview` and `.worktree/plan-188-drum-move-preview` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current drum pad option data, docs, styles, and QA expectations.
- [x] Add a UI-local Drum Move Preview derived from current selected Pattern A/B/C drum data and existing Drum Foundation/Groove Feel/Drum Accent targets.
- [x] Render the preview without changing drum pad buttons, option definitions, apply behavior, or saved project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Drum Move Preview renders, shows current drum posture, updates after Drum Foundation/Groove Feel/Drum Accent clicks, drum pad buttons still apply through undoable paths, selected-drum controls remain editable, and no horizontal overflow appears.

## Review Plan

QA completes before review starts. Review checks that the preview derives only from local selected Pattern A/B/C drum pattern, velocity, timing, chance, and hat repeat data plus existing Drum Foundation/Groove Feel/Drum Accent option targets, stays UI-local, preserves all apply behavior, avoids hidden generation and sampling-first framing, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a read-only Drum Move Preview instead of changing Drum Foundation/Groove Feel/Drum Accent targets or auto-applying suggestions. | The usability gap is seeing rhythm, timing/chance, and velocity changes before clicking, not changing the explicit drum editing model. |
| 2026-06-17 | Keep Drum Move Preview UI-local and derived from existing pad transform targets. | This preserves project schema, undo history, Pattern A/B/C independence, exports, and beat-first product framing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Drum Move Preview. |
| 2026-06-17 | harness_builder | Added Drum Move Preview summary derivation, rendering, responsive CSS, docs, quality guardrails, and QA expectations. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5279` with `listen EPERM`; escalated retry was rejected by environment policy, so no workaround was attempted. |
| 2026-06-17 | review_judge | Reviewed the preview path and found no schema, apply-behavior, export, playback, cloud, AI, sampling, or hidden-generation changes. |

## Completion Notes

Drum Move Preview now appears before Drum Foundation/Groove Feel/Drum Accent Pads, summarizes the current selected Pattern drum posture, suggests the next foundation/feel/accent posture, and shows pre-click move counts from local drum, chance, timing, hat-repeat, note chance, chord chance, and existing pad target data only. The change keeps drum writing explicit and sample-free while preserving all existing pad apply behavior and project data contracts.
