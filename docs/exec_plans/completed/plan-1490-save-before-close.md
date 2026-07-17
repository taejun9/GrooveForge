# plan-1490-save-before-close

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Let a user save the exact current project from the native unsaved-close warning and close only after that durable Save succeeds.

## Evidence and Motivation

Plan 1489 prevents silent data loss, but its native close warning only offers `Close without a project file` or `Keep editing`. A professional desktop workflow normally lets the user save at that decision point. GrooveForge already protects overlapping asynchronous Saves, so the close path must reuse that contract and must not close after cancellation, failure, a stale response, or a snapshot that became outdated while the Save dialog was open.

## Non-Goals

- Adding autosave, version history, cloud sync, accounts, analytics, or remote persistence.
- Changing project serialization, file schema, audio rendering, or browser `beforeunload` limitations.
- Closing after a canceled, failed, stale, or changed-snapshot Save.
- Bypassing the existing unsaved-close guard through an unrestricted force-close IPC.

## Constraints

- QA completes before separate review.
- The native warning offers Save and close, close without a project file, and keep editing.
- Default action is Save and close; Escape/cancel keeps editing.
- Save and close keeps the current unload blocked while the asynchronous Save runs.
- Only `saved-current` may request a second normal window close; that request must pass through the same close guard.
- A recovery-only session must remain open and surface its Restore/Clear decision instead of saving the unrelated visible starter and clearing the recovery record.
- Cancellation, failure, stale completion, and saved-snapshot completion keep the window open with accurate status.
- Recovery presence must be synchronized with Save completion so the second close is not spuriously blocked by a stale React render.
- Existing browser fallback, launch/project-I/O smoke teardown, local-first privacy, composition-first product scope, and unrelated plan-085 worktree remain intact.

## Implementation Plan

- [x] Add a three-action native close-dialog contract with conservative unknown-choice handling.
- [x] Route Save and close to the renderer and expose a guarded normal-close request through preload IPC.
- [x] Return explicit Save outcomes and close only after exact-current success; synchronize recovery state at the unload boundary.
- [x] Add runtime, renderer, desktop-source, and static regressions; update product, architecture, harness, and quality rules.
- [x] Run QA, separate review, sample-audio QA, and full release check; prepare completion refresh, merge/push, main regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-17 | Make Save-before-close the plan-1490 target. | Plan 1489 prevents silent loss but still forces users to dismiss the close warning before performing the normal Save workflow. |
| 2026-07-17 | Keep the first unload blocked and start Save through a renderer command. | Electron's synchronous `will-prevent-unload` decision cannot safely await a native file dialog; a second ordinary close after exact-current success preserves the guard. |
| 2026-07-17 | Close only for `saved-current`. | A cancellation, failure, stale response, or saved snapshot with newer edits is not durable proof that the visible project is saved. |
| 2026-07-17 | Block Save-and-close for recovery-only state and resurface recovery actions. | Saving the clean visible starter would not preserve the prior recovery project and normal Save completion would clear that record. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-17 | project_lead | Created plan-1490 from clean synchronized main `87f50ab4`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-17 | repo_cartographer | Audited the plan-1489 unload guard, native Save IPC, latest-request Save completion contract, preload command validation, and local recovery lifecycle. The scoped state machine can be implemented without changing project data or audio output. |
| 2026-07-17 | review_judge | Pre-QA path review found that recovery-only startup cannot safely reuse current-project Save; added a four-state Save-before-close gate that keeps the window open and resurfaces Restore/Clear instead of deleting unrelated recovery work. |
| 2026-07-17 | harness_builder | Added the three-action dialog, validated Save-and-close renderer command, narrow normal-close IPC, explicit five-outcome Save result, synchronous recovery ref, recovery-only review gate, and second-close-through-the-same-guard path. |
| 2026-07-17 | quality_runner | Typecheck, static QA, runtime/renderer/desktop-entry smoke, workflow/persona smoke, quality gate, build, and real macOS Electron launch smoke passed. Runtime covers 4/4 close states, 4/4 Save gates, 3/3 native actions, and 5/5 Save close outcomes; live Electron retained the 104-id UI matrix. |
| 2026-07-17 | quality_runner | Sample-audio QA regenerated schema-17 output and decoded 41/41 playable WAVs with 41/41 digital-zero endings, 33/33 full-mix tails, and 11/11 isolation checks. Beginner/professional hashes remained `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318` and `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`. |
| 2026-07-17 | review_judge | Separate post-QA review found no blocking, major, or moderate issue across recovery-only preservation, five Save outcomes, duplicate/overlapping Save sequencing, synchronous dirty/recovery refs, the validated renderer command, the guarded normal-close IPC, Electron's inverted unload contract, or updater-driven window close ordering. |
| 2026-07-17 | quality_runner | Full `npm run release:check` exited 0 after source, runtime, 41-WAV sample, live Electron, native/packaged/PKG-payload/installed project I/O, DMG/PKG, signing-truth, privacy, and release-evidence checks. |
| 2026-07-17 | plan_keeper | Marked implementation, final-code QA, separate review, full release verification, and sample regeneration complete; prepared the completed plan, review mirror, merge/push, main regeneration, 10-plan checkpoint refresh, and worktree cleanup. |
