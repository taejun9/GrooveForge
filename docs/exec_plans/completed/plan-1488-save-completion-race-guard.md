# plan-1488-save-completion-race-guard

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep durable Save completion, unsaved-change status, file identity, and renderer-local recovery aligned when the project changes or another Save starts while an earlier native Save request is pending.

## Evidence and Motivation

On synchronized main `5687c4cc`, `handleSaveProject` captures `projectToSave`, awaits the native bridge, then unconditionally clears local recovery and marks the project clean. A background tap-tempo commit, MIDI/edit event, or overlapping Save can replace `projectRef.current` during that await. The completed file then contains an older snapshot while GrooveForge labels newer editable content saved and deletes its recovery evidence. An older Save completion can also overwrite the status and file label established by a newer request.

## Non-Goals

- Adding autosave, file versioning, cloud sync, accounts, analytics, or remote persistence.
- Changing project serialization, native dialog IPC, or the `.grooveforge.json` schema.
- Treating object equality as a full saved-history cursor.
- Replacing human concurrent-dialog and listening review with automated checks.

## Constraints

- QA completes before separate review.
- Only the latest Save request may update file identity, result, or status.
- A successful latest Save marks clean and clears recovery only when the current project is the exact snapshot that was serialized.
- If newer project content exists, retain dirty/recovery state and explicitly tell the user to save again.
- Cancel/failure from an older request must not overwrite a newer request's feedback.
- Browser download fallback follows the same completion contract.
- Existing local-first privacy, sample-free product scope, and unrelated plan-085 worktree remain intact.

## Implementation Plan

- [x] Add a dependency-free Save completion decision contract covering current, changed, and stale requests.
- [x] Integrate request sequencing and saved-snapshot checks into Save/download feedback and recovery cleanup.
- [x] Add runtime/renderer/static regressions and update product, architecture, harness, and quality rules.
- [x] Run QA, separate review, sample-audio QA, and full release check; prepare completion refresh, merge/push, main sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-17 | Make asynchronous Save completion safety the plan-1488 target. | The current success path can claim newer content is durable and remove its only recovery draft even though the written file contains an older snapshot. |
| 2026-07-17 | Use monotonic request identity plus exact project snapshot identity. | Request identity blocks older completions from overwriting newer feedback; project identity safely detects every immutable project replacement without adding a saved-history cursor. |
| 2026-07-17 | Invalidate pending Save completion at the full-project replacement boundary. | A late Save for project A must not overwrite the active file identity established by opening or importing project B; ordinary edits still resolve as a successfully saved older snapshot with newer dirty content. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-17 | project_lead | Created plan-1488 from clean synchronized main `5687c4cc`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-17 | quality_runner | Source audit confirmed Save serializes one project object, awaits IPC, then clears draft/dirty state without checking either the latest request or `projectRef.current`. |
| 2026-07-17 | harness_builder | Added the dependency-free current/changed/stale completion resolver, monotonic request sequencing, exact saved-snapshot cleanup, warning feedback for newer edits, and full-project replacement invalidation before file identity changes. |
| 2026-07-17 | quality_runner | Typecheck, static QA, renderer/runtime smoke, beginner/producer workflow and persona smoke, quality gate, production build, and `git diff --check` passed. Runtime covers 4/4 completion paths; sample QA regenerated and decoded 41/41 playable WAVs with 41/41 digital-zero endings, 33/33 full-mix tails, and 11/11 isolation checks. |
| 2026-07-17 | review_judge | Separate post-QA review found and fixed a late Save-A completion that could overwrite file identity after project B was opened. Final review found no remaining blocking, major, or moderate issue in current/changed/stale/cancel/failure/replacement paths. |
| 2026-07-17 | quality_runner | Full `npm run release:check` exited 0 outside the restricted GUI sandbox after source, runtime, 41-WAV sample, live Electron, native/packaged/PKG payload/installed project I/O, package/signing truth, privacy, and release-evidence checks. The first restricted attempt stopped only at the intentional AppKit sandbox guard. |
| 2026-07-17 | quality_runner | Regenerated final post-package schema-17 audio: 41/41 WAVs ended at digital zero, 33/33 full mixes retained tail content, and 11/11 isolation checks passed. Beginner and professional WAV SHA-256 values remained `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318` and `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`. |
| 2026-07-17 | plan_keeper | Marked implementation, final-code QA, separate review, full release verification, and post-package sample regeneration complete; prepared completion evidence refresh, merge, push, main regeneration, and worktree cleanup. |
| 2026-07-17 | plan_keeper | Completion summary refresh passed with latest completed plan `plan-1488`, progress `1481-1490: 8/10`, local release readiness 100%, six fresh completion artifacts, and no stale or missing artifacts; the 10-plan checkpoint is correctly not due. |
