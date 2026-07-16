# plan-1486-project-dirty-recovery-lifecycle

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep unsaved-change status and renderer-local crash recovery aligned with the actual editable project after file replacement and history restoration. The first meaningful edit after opening a project must create recovery evidence, and Undo/Redo after a durable save must not leave a changed project labeled as saved.

## Evidence and Motivation

On synchronized main `4a815f74`, `replaceProject` arms `localDraftSkipNextWriteRef` and sets local draft writing false. The local-draft effect checks the false armed state before consuming the skip flag, so the next user edit consumes the stale flag and is not written. Separately, `restoreProjectFromHistory` replaces project content but never marks the project unsaved or arms recovery writes. After Save followed by Undo, the editable state differs from the durable file while the UI can still report no unsaved changes.

## Non-Goals

- Adding cloud sync, remote persistence, accounts, analytics, or external distribution credentials.
- Replacing the existing renderer-local recovery record format or durable project file schema.
- Implementing a saved-history cursor that automatically marks Redo-to-save-point clean.
- Replacing human crash/relaunch and listening review with automated state, storage, and sample checks.

## Constraints

- QA completes before separate review.
- Full-project replacement itself must not create a misleading local recovery draft.
- The first subsequent content edit must be recovery-write eligible without requiring a second edit.
- Undo/Redo restoration must conservatively mark content dirty and recovery-write eligible.
- Save still clears recovery only after a successful durable save/download; cancel/failure behavior stays intact.
- Existing project replacement, history stacks, sample schema, and local-first privacy boundaries remain intact.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Extract or clarify the local-draft write gate so replacement skip state is consumed by replacement, not the first edit.
- [x] Mark history-restored projects dirty and recovery-write eligible; add renderer/runtime regression coverage.
- [x] Run QA, separate review, sample-audio QA, full release check, completion refresh, merge/push, main sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make first-edit recovery and history dirty-state lifecycle the plan-1486 target. | Both defects can cause the UI or recovery store to understate unsaved user work after ordinary open/save/undo flows. |
| 2026-07-16 | Use conservative dirty marking for every successful history restore. | Without a saved-history cursor, claiming clean after content replacement is unsafe; a later durable save can establish clean state again. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1486 from clean synchronized main `4a815f74`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Source audit reproduced the stale replacement skip flag and confirmed history restoration changes `projectRef.current` without updating unsaved or recovery-write state. |
| 2026-07-16 | harness_builder | Added a dependency-free local-draft write gate, consumed replacement suppression before the first later edit, and made history restoration mark project content unsaved plus recovery-write eligible. Runtime covers 4/4 boolean paths; renderer coverage checks the App integration and Undo/Redo state transitions. |
| 2026-07-16 | quality_runner | Typecheck, static QA, runtime and renderer smoke, workflow and persona smoke, quality gate, build, sample-audio QA, and `git diff --check` passed. Schema 17 remains 41/41 playable digital-zero WAVs, 33/33 full mixes with tail content, and 11/11 isolation checks. |
| 2026-07-16 | review_judge | Separate post-QA review found no blocking, major, or moderate issue. All four armed/skip states and the replacement-to-first-edit sequence preserve one suppressed replacement write followed by an eligible recovery write; every successful history restore conservatively becomes dirty. |
| 2026-07-16 | quality_runner | Full `npm run release:check` exited 0 after source, sample, live Electron, native/project-file, packaged app, PKG payload, simulated install, privacy, and value-free release-evidence checks. External distribution remained correctly unclaimed without private credentials and approvals. |
| 2026-07-16 | quality_runner | After packaging, regenerated schema-17 sample audio: 41/41 WAVs ended at digital zero, 33/33 full mixes retained tail content, and 11/11 isolation checks passed. Beginner and professional audience WAVs reproduced SHA-256 `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318` and `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`. |
| 2026-07-16 | plan_keeper | Marked implementation, QA, separate review, full release verification, and final sample regeneration complete; prepared completion move, evidence refresh, merge, push, and worktree cleanup. |
| 2026-07-16 | plan_keeper | Completion refresh passed with latest completed plan `plan-1486` and progress `1481-1490: 6/10`; final static QA, sample hashes, and diff whitespace checks remained clean before commit. |
