# plan-090-sound-focus-pads

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add Sound Focus Pads to the Sound Designer so beginners can quickly choose useful tone postures and producers can reshape editable local sound-design state without opening every Studio tone control.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, imported audio assets, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No new project schema fields.
- No mutation of Pattern A/B/C musical events, arrangement blocks, mixer state, master state, Delivery Target, Session Brief, snapshots, or export commands.
- No hidden generation, randomization, automatic rendering, or downloaded files.

## Context Map

- `src/ui/App.tsx`: Sound Designer UI, project update handlers, local pad patterns.
- `src/domain/workstation.ts`: `SoundDesign`, sound presets, persistence normalization.
- `src/styles.css`: workstation panel and button layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: beat-first product docs and QA guardrails.
- `harness/scripts/run_qa.py`: static product and source expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-090-sound-focus-pads` and `.worktree/plan-090-sound-focus-pads` for git repository work.
- Sound Focus Pads must be deterministic, explicit-click, undoable, and fully editable afterward through existing Sound Designer controls.
- Sound Focus Pads update only `project.sound` through existing project history and preserve realtime playback plus WAV/stem export semantics through current sound consumers.

## Implementation Plan

- [x] Add Sound Focus Pad definitions and option summaries derived from the current `SoundDesign`.
- [x] Add an undoable app handler that applies a selected pad to `project.sound` and marks the sound preset as custom.
- [x] Render Sound Focus Pads in `SoundDesigner` with compact labels, tone previews, and changed-parameter counts.
- [x] Style the pads without disrupting the existing workstation shell.
- [x] Update durable docs and QA expectations for the new direct sound-design workflow.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Sound Focus Pads render, applying a pad updates sound controls/readouts, Undo restores the previous sound state, console errors stay empty, and the workstation has no incoherent overflow.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that Sound Focus Pads remain composition-first, deterministic, local, undoable, editable, and limited to sound-design state.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Sound Focus Pads before optional sampling or deeper plugin features. | Fast tone direction helps beginners hear useful sound-design changes and gives producers a quick editable starting point without imported audio or hidden generation. |
| 2026-06-16 | Keep pads as custom sound-design state, not new project schema. | Existing `SoundDesign` fields already drive realtime and offline render paths, so the feature can remain low-risk and fully editable. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Sound Focus Pads. |
| 2026-06-16 | harness_builder | Added Punch, Warm, Air, and Space Sound Focus Pads that update only editable `SoundDesign` state through project history. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for Sound Focus Pads. |
| 2026-06-16 | quality_runner | Ran typecheck, static QA, verify, browser smoke, npm QA, and diff whitespace checks. |
| 2026-06-16 | review_judge | Reviewed state scope, undoability, manual editability, UI density, and sampling boundary. |

## Completion Notes

Sound Focus Pads are implemented as explicit local tone-posture controls inside the Sound Designer. Applying a pad updates only project sound-design values, marks the sound preset as custom, remains undoable, and keeps manual Studio tone controls editable.
