# plan-789-blueprint-preview-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Beat Blueprint Preview/Cue/Decision Quick Action result metrics identify the explicit preview action, blueprint or preview-decision context, loop/cue posture, style/key/BPM/arrangement/sound/master starter posture, selected Pattern, editable event count, arrangement block count, song length, export readiness, and next preview/apply check so beginners can choose a sample-free starter confidently and working producers can scan whether a blueprint fits the session before applying it.

## Non-Goals

- Do not change Beat Blueprint definitions, preview state, apply behavior, style templates, generated Pattern A/B/C events, arrangement templates, sound presets, mixer/master algorithms, project schema, undo/redo, playback scheduling, render/export, MIDI export, Handoff, or Command Reference command definitions.
- Do not add auto-apply, command chains, autoplay, autosave, hidden generation beyond explicit blueprint apply, remote AI, sampling, imported audio, sampler devices, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Beat Blueprint Quick Actions, preview/cue/decision handling, generic Quick Action result metrics, and follow-up text.
- `README.md` and `docs/product/product.md` describe Beat Blueprints as sample-free editable project starts.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin blueprint preview/apply boundaries, local result feedback, direct composition, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-789-blueprint-preview-result-clarity` and `.worktree/plan-789-blueprint-preview-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Beat Blueprint preview/cue/decision Quick Action result metric routing.
- [x] Add structured preview/cue/decision result metric helpers without changing blueprint preview/apply behavior, project schema, playback, or export.
- [x] Update product/docs language and QA harness expectations for blueprint preview result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Beat Blueprint preview/cue/decision result feedback is clearer while preserving preview state, apply routing, generated musical events, arrangement data, sound/mix/master defaults, undo/redo, project schema, playback, export, remote, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve blueprint preview/cue/decision result metrics instead of changing blueprint preview/apply handlers. | Existing handlers already preserve sample-free starter behavior; richer result metrics make starter selection clearer without changing project data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 788 completed plans; next 10-plan progress checkpoint is plan-790. |
| 2026-06-26 | plan_keeper | Found that direct Blueprint preview actions had a preview metric while Preview Decision and Preview Cue fell back to generic project events; implemented a shared preview metric snapshot for Preview, Decision, and Cue results and pinned the direct-composition contract in docs and harness expectations. |
| 2026-06-26 | review_judge | Post-QA review completed with no findings; Compare Style Match result context was tightened to prefer the executed command detail before final QA reruns. |

## QA Log

| command | result |
|---|---|
| `git diff --check` | Passed. |
| `python3 harness/scripts/run_qa.py` | Passed after implementation. |
| `npm run typecheck` | Passed after implementation. |
| `python3 harness/scripts/run_quality_gate.py` | Passed. |
| `npm run build` | Passed with existing Vite chunk-size warning. |
| `npm run qa` | Passed. |
| `npm run verify` | Passed with existing Vite chunk-size warning. |

## Review Log

Post-QA review completed with no findings. The change is limited to Quick Actions Beat Blueprint preview/cue/decision result metrics plus matching docs and harness expectations; it preserves Blueprint definitions, preview/apply routing, generated musical events, arrangement templates, sound presets, mixer/master algorithms, project schema, playback, export, Handoff, remote, and sampler boundaries.
