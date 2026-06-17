# plan-223-session-brief-starters

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add explicit Session Brief Starter Pads so beginners can quickly fill useful handoff context and experienced producers can standardize artist/vibe/reference/notes fields for the selected delivery target without changing the project schema.

## Non-Goals

- Do not add cloud collaboration, accounts, remote AI, analytics, or external writing services.
- Do not add audio uploads, reference-track import, sampling, sample browsing, sampler devices, or media analysis.
- Do not change Session Brief field limits, saved schema, export file formats, Handoff Sheet contents outside existing fields, playback, render, or export behavior.
- Do not auto-fill fields without an explicit user click.

## Context Map

- `src/domain/workstation.ts` owns `SessionBrief`, field limits, and project migration.
- `src/ui/App.tsx` owns Session Brief UI, update handlers, role readout, Handoff Sheet, and project state.
- `src/styles.css` owns dense form/readout styling.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` describe durable product behavior and guardrails.
- `harness/scripts/run_qa.py` enforces docs/code expectations.

## Implementation Plan

- [x] Inspect existing Session Brief data model, UI handlers, readout, docs, and QA expectations.
- [x] Add explicit starter pad definitions that derive target-aware brief text from current local project/style/delivery target.
- [x] Route starter pad clicks through existing undoable project updates and show a UI-local result strip.
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

QA completes before review starts. Review checks explicit-click mutation only, existing Session Brief fields only, no schema/export/playback drift, no remote/cloud/media/sampling scope, and no Handoff behavior regression.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add Session Brief Starter Pads using existing brief fields. | The feature improves beginner ease and pro handoff consistency while avoiding new schema or cloud/media scope. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created in `codex/plan-223-session-brief-starters`. |
| 2026-06-17 | harness_builder | Added Session Brief Starter Pads, UI-local result strip, docs guardrails, and static QA coverage. |
| 2026-06-17 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`. Browser smoke could not run because localhost dev server binding failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; the escalated retry was rejected by environment policy. |
| 2026-06-17 | review_judge | Reviewed explicit-click mutation, blank-field preservation, UI-local result state, saved schema stability, docs guardrails, and no sampling/remote/media scope; no findings. |

## Completion Notes

Session Brief Starter Pads are complete. Users can click Starter, Vocal, Store, or Club pads to fill only blank artist, vibe, reference, and notes fields from local project title, style, key, BPM, arrangement length, Delivery Target, stem goal, and mix posture context. The result strip is UI-local, existing manual brief edits are preserved, and project schema, Handoff Sheet, Handoff Pack, playback, render/export behavior, sampling scope, and remote/cloud behavior are unchanged.
