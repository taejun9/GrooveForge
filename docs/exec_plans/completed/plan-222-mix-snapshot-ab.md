# plan-222-mix-snapshot-ab

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Mix Snapshot A/B surface in the Mixer so users can capture two current mix/master states, compare headroom, balance, master, and stem posture, and quickly understand which pass is safer without changing project schema or export behavior.

## Non-Goals

- Do not persist Mix Snapshot A/B slots in `.grooveforge.json` or change project schema.
- Do not add rendered reference audio, imported audio, sample browsing, sampler devices, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.
- Do not change mixer/master algorithms, export file contents, playback scheduling, save/load, Handoff Sheet, Handoff Pack, or Project Snapshots.
- Do not auto-save snapshots, auto-export, autoplay, or apply mix changes from the comparison.

## Context Map

- `src/ui/App.tsx` owns mixer UI, export/stem analysis summaries, UI-local result strips, and project state.
- `src/styles.css` owns dense Mixer panel styling.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` describe durable product behavior and guardrails.
- `harness/scripts/run_qa.py` enforces docs/code expectations.

## Implementation Plan

- [x] Add UI-local Mix Snapshot A/B state derived from current project, export analysis, and stem analysis.
- [x] Add Mixer buttons to capture A and B snapshots without mutating project data.
- [x] Render a compact compare readout for headroom, balance, master, and stems with beginner/pro labels.
- [x] Update durable docs and static QA expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke only if the environment permits local dev-server binding.

## Review Plan

QA completes before review starts. Review checks UI-local state only, no schema/export/playback drift, deterministic local analysis, no hidden mix application, no reference-audio/import/sampling drift, and no remote/cloud behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add Mix Snapshot A/B as UI-local state. | Producers need fast mix comparison and beginners need clear safer-pass labels, but persistence/schema changes are not needed for this pass. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created in `codex/plan-222-mix-snapshot-ab`. |
| 2026-06-17 | harness_builder | Added UI-local Mix Snapshot A/B state, capture/clear controls, safer-pass comparison, responsive styling, docs, and QA expectations. |
| 2026-06-17 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`. Browser smoke could not run because localhost dev server binding failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; the escalated retry was rejected by environment policy. |
| 2026-06-17 | review_judge | Reviewed UI-local derivation, no schema/export/playback drift, layout containment, and no sampling/remote scope; no findings. |

## Completion Notes

Mix Snapshot A/B is complete as a UI-local Mixer surface. Users can capture A and B from the current local mix/master state, compare safer-pass headroom, stem balance, master output, and audible stem posture, and clear the slots without changing project schema, undo history, playback, render/export contents, Project Snapshots, sampling scope, or remote/cloud behavior.
