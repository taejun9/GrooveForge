# plan-318-master-finish-quick-action-results

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Make Master Finish Quick Actions feel like reliable final-output tools by giving the Demo, Vocal, Store, and Club commands specific post-run result metrics and follow-up guidance instead of generic Mix posture feedback.

## Non-Goals

- Do not change Master Finish pad definitions, Master Finish Preview, visible pad behavior, Master Finish Result panel behavior, master/mixer schema, save/load, undo/redo, playback, WAV/stem/MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add hidden mastering, auto-mastering, loudness guarantees, platform compliance claims, modal confirmations, command chains, autoplay, auto-save, auto-export, sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Master Finish pad definitions, Quick Actions generation, result metric snapshots, follow-up copy, Master Finish result helpers.
- `README.md`: Quick Actions and Master Finish feature summaries.
- `docs/product/product.md`: mixer/master and Quick Actions product behavior.
- `docs/quality/rules.md`: Master Finish and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-318-master-finish-quick-action-results` and `.worktree/plan-318-master-finish-quick-action-results` for repository work.

## Implementation Plan

- [x] Inspect existing Master Finish command ids, apply handler, result metric, and follow-up paths.
- [x] Add a local helper mapping Master Finish Quick Action ids to their existing pad definitions.
- [x] Return Master Finish-specific Quick Action result metrics for preset, ceiling, and output posture using current local project state.
- [x] Return Master Finish-specific audition cue and next check consistent with the visible Master Finish Result.
- [x] Update durable docs and QA expectations to keep Master Finish command feedback explicit, local, deterministic, editable, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run Demo/Vocal/Store/Club Master Finish Quick Actions, confirm result metrics/follow-up copy are specific and no autoplay/export/sampling entry point appears.

## Review Plan

QA completes before review starts. Review checks that Master Finish Quick Action feedback derives only from existing Master Finish command ids, pad definitions, and local project state, keeps commands routed through existing `onApplyMasterFinish`, preserves undoable master output edit semantics and visible Master Finish Result behavior, and avoids sampling, autoplay, auto-export, hidden mastering, command chains, or cloud scope.

## QA Results

| command | result |
|---|---|
| `python3 harness/scripts/run_qa.py` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run typecheck` | passed |
| `npm run build` | passed with existing Vite large chunk warning |
| `npm run qa` | passed |
| `npm run verify` | passed with existing Vite large chunk warning |
| `git diff --check` | passed |
| Browser smoke | blocked: sandboxed and escalated localhost dev server attempts failed with `listen EPERM` / environment policy rejection |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Master Finish-specific Quick Action result metrics and follow-up copy. | The commands already exist, but generic post-run feedback weakens confidence at the final output stage for beginners and slows producers checking target posture. |
| 2026-06-18 | Record Browser smoke as blocked instead of bypassing localhost policy. | The sandbox denied the dev server with `listen EPERM`, and the escalated retry was rejected by environment policy. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming direct Master Finish Quick Actions exist but use generic Mix posture result feedback. |
| 2026-06-18 | harness_builder | Added Master Finish Quick Action pad lookup, result posture metric, and preset-specific follow-up copy using existing pad definitions and current local master state. |
| 2026-06-18 | doc_gardener | Updated README, product, quality, and QA expectations so Master Finish Quick Action result feedback remains explicit, local, deterministic, editable, and sample-free. |
| 2026-06-18 | quality_runner | Static QA, quality gate, typecheck, build, full QA, verify, and diff checks passed; Browser smoke was blocked by localhost policy. |
| 2026-06-18 | review_judge | Reviewed post-QA scope for local-state derivation, existing Master Finish routing, no sampling/autoplay/auto-export/cloud expansion, and documentation alignment. |
