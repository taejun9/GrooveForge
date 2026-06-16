# plan-151-project-safety-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local project safety readout near the session meter so users can distinguish a renderer-local draft safety net from a durable `.grooveforge.json` save/download state.

## Non-Goals

- Do not change local draft write, restore, clear, save, open, or download behavior.
- Do not add autosave to the filesystem, background versioning, cloud sync, accounts, analytics, remote AI, imported audio, or sampling.
- Do not persist readout fields in the project file or change save/load schema.
- Do not change playback, render, WAV/stem/MIDI export, Handoff Sheet, snapshots, Quick Actions, or undo/redo behavior.

## Context Map

- `src/ui/App.tsx`: local draft state, project status, save/open handlers, session meter rendering, and readout derivation.
- `src/styles.css`: session meter and compact readout styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: local draft recovery quality boundary.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-151-project-safety-readout` and `.worktree/plan-151-project-safety-readout` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Add a derived project safety summary from local draft recovery state, local draft timestamp, and project status.
- [x] Render the readout near the session meter with stable test IDs while preserving existing `local-draft-status`.
- [x] Add compact styling that does not confuse draft recovery with durable file save.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for initial local-project state, edit-triggered local draft state, and session meter containment.

## Review Plan

QA completes before review starts. Review checks that the readout is UI-local, preserves local draft/save/open semantics, avoids implying cloud or filesystem autosave, keeps the session meter usable, and avoids sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add a read-only safety readout instead of changing draft or save behavior. | The need is clearer trust and orientation, not a new persistence model. |
| 2026-06-16 | Arm local draft writes only after real project edits. | React StrictMode dev remounts should not create a recovery draft before the user changes the beat. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for project safety visibility. |
| 2026-06-16 | harness_builder | Added project safety summary, session-meter readout, direct-child session meter styling, draft-write arming, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | CDP smoke passed for initial local-project state, edit-triggered local draft state, no nested pill style leak, and session meter containment. |
| 2026-06-16 | review_judge | Reviewed UI-local derivation, local draft/save semantics, initial draft write prevention, layout containment, and no sampling/cloud/remote scope; no findings. |

## Completion Notes

Completed. GrooveForge now shows a UI-local project safety readout near the session meter that distinguishes a renderer-local draft safety net from a durable `.grooveforge.json` save/download state. Local draft writing is armed only after real project edits, so development StrictMode remounts do not create a recovery draft before the user changes the beat. Existing Save/Open, Restore Draft, Clear Draft, playback, render, WAV/stem/MIDI export, Handoff Sheet, snapshots, Quick Actions, and undo/redo behavior remain unchanged.
