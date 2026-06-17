# plan-235-blueprint-quick-focus

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily. Keep sampling secondary and keep the product centered on direct beat composition.

## Goal

Make Blueprint Quick Actions reveal the Beat Blueprints panel after preview or apply commands. Users should land on the preview/result they just triggered without changing project data beyond the explicit existing apply path.

## Non-Goals

- Do not change Beat Blueprint definitions, style profiles, project schema, render logic, save/load format, playback, or export semantics.
- Do not reorder Quick Actions, change search ranking, change the generic/apply/preview command ids, or add modal confirmations.
- Do not add hidden generation, auto-apply, command chains, sampling, imported audio, sampler devices, remote AI, plugin hosting, accounts, analytics, cloud sync, autoplay, auto-save, or auto-export.

## Context Map

- `src/ui/App.tsx`: Blueprint preview/apply handlers, Quick Actions definitions, BeatBlueprints component, local refs and scroll behavior.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product capability inventory.
- `docs/quality/rules.md`: Quick Actions / Beat Blueprint guardrails.
- `harness/scripts/run_qa.py`: static product and UI-token expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-235-blueprint-quick-focus` and `.worktree/plan-235-blueprint-quick-focus` for git repository work.

## Implementation Plan

- [x] Add a UI-local Beat Blueprints panel ref and pass it to the panel section.
- [x] Make Quick Actions preview/apply paths scroll to the Beat Blueprints panel after the existing preview/apply handlers run.
- [x] Preserve in-panel Blueprint preview button behavior and existing apply/result behavior.
- [x] Update docs/static QA expectations for local focus movement with no schema, render, playback, export, or sampling drift.
- [x] Run QA, then review the diff after QA passes.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that focus movement is UI-local, only runs from explicit Blueprint Quick Actions, preserves existing preview/apply handlers, does not mutate project data outside the existing Blueprint apply path, and preserves Quick Actions search/filter/Spotlight/Recent/result, save/load, playback, WAV/stem/MIDI export, Handoff, and sampling guardrails.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add focus movement to Blueprint Quick Actions instead of duplicating preview content inside the command palette. | Reusing the existing panel keeps one source of truth for preview/result metrics while improving beginner/pro navigation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after confirming preview/apply Quick Actions can stage Blueprint state but do not reveal the panel where users inspect it. |
| 2026-06-17 | harness_builder | Added a Beat Blueprints panel ref and routed only Quick Actions Blueprint preview/apply wrappers to reveal the existing panel. |
| 2026-06-17 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run typecheck`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`. |
| 2026-06-17 | review_judge | Reviewed UI-local ref routing, wrapper-only focus movement, panel button preservation, no schema/render/export drift, and sampling guardrails; no findings. |

## Completion Notes

Completed. Blueprint Quick Actions now reveal the existing Beat Blueprints panel after explicit preview or apply commands. The focus movement uses a UI-local panel ref, while panel preview/apply buttons, existing Quick Action ids/search/filter/Spotlight/Recent/result behavior, project data, save/load, playback, WAV/stem/MIDI export, Handoff state, and sampling boundaries are preserved.
