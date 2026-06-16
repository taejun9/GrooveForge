# plan-104-review-queue

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working composers/producers can respect and first-time composers can use easily.

## Goal

Add a read-only Review Queue that turns the current beat state into a short ordered list of production issues to review. Beginners should see the next few concrete weak spots without needing DAW vocabulary, while working producers can scan composition, arrangement, mix/master, and handoff risks before exporting.

## Non-Goals

- No sample import, audio clips, sampler tracks, audio recording, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No mutation of Pattern A/B/C musical events, arrangement blocks, mixer, sound design, master state, Delivery Target, Beat Readiness, Beat Map, Next Move, Finish Checklist, Project Snapshots, exports, MIDI, or Handoff Sheet semantics.
- No hidden auto-fix, hidden mastering, hidden auto-arrangement, LUFS, true-peak, platform compliance, publishing, licensing, professional release-readiness, or commercial success claims.
- No new project schema; Review Queue must be derived read-only UI.

## Context Map

- `src/ui/App.tsx`: Beat Readiness, Beat Passport, Finish Checklist, Beat Map, Structure Lens, Mix Coach, Master panel.
- `src/styles.css`: compact status panel/card conventions.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product framing and QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and code tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-104-review-queue` and `.worktree/plan-104-review-queue` for git repository work.
- Review Queue must remain read-only, deterministic, and local.
- It must derive from existing project/readiness/structure/export/stem/mix/target/brief state, not remote analysis or hidden generation.
- It must preserve existing realtime playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Sheet, and all editing semantics.

## Implementation Plan

- [x] Add Review Queue item/summary types and deterministic derivation helper.
- [x] Render a compact read-only Review Queue in the Master panel near Finish Checklist.
- [x] Style the queue responsively without horizontal overflow.
- [x] Update docs and QA expectations for production issue scanning.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Review Queue renders local issue rows, has no controls, leaves master/mix controls editable, does not mutate project state, console errors stay empty, and no horizontal overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that Review Queue is read-only, local, deterministic, derived from existing project/render data, useful for beginners and producers, and preserves export plus non-sampling product boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Review Queue after Finish Checklist. | Finish Checklist shows readiness by stage; users still need a short prioritized list of concrete issues to review before export. |
| 2026-06-16 | Keep Review Queue read-only and schema-free. | Existing readiness, structure, mix, export, target, and brief state is sufficient, and auto-fixing from a review list would blur diagnosis with editing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for local read-only Review Queue. |
| 2026-06-16 | harness_builder | Added Review Queue summary derivation, Master panel UI, responsive styles, docs, and QA expectations. |
| 2026-06-16 | quality_runner | Ran `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, and `npm run verify`; all passed. |
| 2026-06-16 | quality_runner | Browser smoke confirmed Review Queue issue rows, no queue controls, editable master ceiling input, no console errors, and no list/body overflow. |

## Completion Notes

Completed. Review Queue now provides a local read-only prioritized production issue list in the Master panel. It derives only from existing project, Beat Readiness, Structure Lens, Mix Coach, export, stem, Delivery Target, and Session Brief state; it does not mutate the beat, trigger exports, auto-fix issues, or add sampling/remote analysis scope.
