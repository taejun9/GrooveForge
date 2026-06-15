# plan-039-pattern-variation-tools

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working producers while staying easy for first-time composers.

## Goal

Add one-click Pattern A/B/C variation tools that transform the selected pattern into useful direct-composition variants without sampling, remote AI, or hidden audio assets. Beginners should be able to get a usable verse/hook/break idea quickly; working producers should get editable musical event changes they can refine.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, plugin hosting, MIDI recording, or remote AI.
- No random or non-reproducible generation.
- No replacement of style presets, chord progression tools, or manual editing.
- No hidden mutation of unselected pattern slots.

## Context Map

- `src/domain/workstation.ts`: Pattern data, Pattern A/B/C helpers, note/chord/drum normalization, style blueprints.
- `src/ui/App.tsx`: Pattern tools UI and `updateCurrentPattern`.
- `src/audio/scheduler.ts`, `src/audio/render.ts`: should continue consuming normal pattern data without new dependencies.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: durable product and QA framing.
- `harness/scripts/run_qa.py`: static expectations for core feature coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-039-pattern-variation-tools` and `.worktree/plan-039-pattern-variation-tools` for git repository work.
- Keep generated changes as editable local musical events, not rendered audio.

## Implementation Plan

- [x] Add deterministic Pattern variation preset IDs, labels, and a domain helper that returns cloned editable pattern data.
- [x] Implement Subtle, Hook, and Breakdown variations over drums, hat repeats, probabilities, bass notes, melody notes, and chord velocities.
- [x] Add Pattern tool buttons for applying variations to the selected pattern through undoable project history.
- [x] Update docs and QA rules so pattern variation remains direct-composition, deterministic, and sample-free.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: apply each variation, confirm Pattern event counts/status update, undo works, playback still starts/stops, and no console errors appear.

## Review Plan

QA completes before review starts. Review checks that variation tools are deterministic, selected-pattern scoped, undoable, editable after application, and do not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement local deterministic variation presets instead of AI generation. | The product should help beginners and producers move fast while keeping direct composition, editable events, and local-first behavior as the core. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created after confirming Pattern tools only supported copy/clear and did not yet offer one-click musical variation. |
| 2026-06-15 | harness_builder | Added Subtle, Hook, and Break variation helpers that transform cloned editable pattern data deterministically. |
| 2026-06-15 | harness_builder | Added Pattern tool buttons that apply variations only to the selected Pattern A/B/C slot through normal undo history. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for deterministic Pattern variation tools. |
| 2026-06-15 | quality_runner | Ran typecheck, static QA, quality gate, verify, diff check, and browser smoke validation. |

## Completion Notes

Pattern variation tools are implemented and verified. Subtle, Hook, and Break presets mutate only the selected pattern as editable musical events, remain undoable, and avoid sampling or remote generation.
