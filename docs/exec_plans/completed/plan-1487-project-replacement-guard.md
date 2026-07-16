# plan-1487-project-replacement-guard

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Prevent Open/import from silently discarding the current unsaved project or a renderer-local recovery draft discovered from an earlier session. A valid replacement file may replace either protected state only after an explicit local confirmation, while Open remains direct when neither exists.

## Evidence and Motivation

On synchronized main `1ac33c0a`, `loadProjectText` parses a selected file and immediately calls `replaceProject`. That replacement marks the project clean and calls `clearLocalDraftState`, even when `projectHasUnsavedChanges` is true. The Open button, native Open command, Quick Actions Open command, and browser import fallback therefore share a destructive path with no confirmation and no retained recovery copy. A user can lose the current beat and its only crash-recovery record by opening another valid project.

## Non-Goals

- Adding autosave, file versioning, cloud sync, accounts, analytics, or remote persistence.
- Changing the `.grooveforge.json` schema, parser limits, or native file-dialog implementation.
- Adding a new-project workflow or a custom modal framework.
- Replacing human file-dialog and listening review with automated checks.

## Constraints

- QA completes before separate review.
- Parse and validate the candidate file before asking to discard current work; invalid files must never prompt or replace.
- Projects with neither unsaved changes nor a discovered recovery draft open without an unnecessary confirmation.
- Unsaved changes, a recovery-only startup state, or both require a deliberate local confirmation before project replacement and local-draft clearing.
- Canceling the replacement must keep current project data, playback, history, file identity, dirty state, and local recovery intact.
- A focused master-ceiling draft resolved immediately before replacement must participate in dirty-state protection.
- All Open surfaces continue through the shared load path.
- Existing local-first privacy, sample-free product scope, and unrelated plan-085 worktree remain intact.

## Implementation Plan

- [x] Add a deterministic project-replacement guard contract and current dirty-state reference.
- [x] Apply the guard after successful parsing and before playback stop/project replacement; cover clean, confirm, cancel, recovery-only, and focused-draft paths.
- [x] Run QA, separate review, sample-audio QA, and full release check.
- [x] Refresh completion evidence and prepare the verified completion commit for merge/push, main sample regeneration, and worktree cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make destructive Open/import protection the plan-1487 target. | The current shared replacement path can erase both unsaved project content and its single renderer-local recovery record without consent. |
| 2026-07-16 | Guard only after candidate parsing succeeds. | Invalid or canceled file selections do not threaten current content and should not ask users to discard work. |
| 2026-07-16 | Keep the confirmation renderer-local and synchronous. | A bounded local confirmation protects every native/browser/Quick Actions Open route without changing file IPC, project schema, or privacy boundaries. |
| 2026-07-16 | Expand the guard from dirty-only to dirty/recovery state. | Separate review found that startup recovery can exist while the current starter is marked clean; Open must not erase that prior-session draft silently. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1487 from clean synchronized main `1ac33c0a`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Source audit confirmed every valid Open/import route reaches `replaceProject`, which clears dirty and local-draft state without consulting `projectHasUnsavedChanges`. |
| 2026-07-16 | review_judge | Separate review found a recovery-only startup gap in the first implementation; expanded the pure guard to all four dirty/recovery combinations before approval. |
| 2026-07-16 | harness_builder | Added the dependency-free two-input replacement guard, synchronous dirty ref, shared post-parse App integration, and runtime/renderer/static QA coverage for parse order, current state inputs, focused draft resolution, cancellation, and replacement ordering. |
| 2026-07-16 | quality_runner | Final-code typecheck, static QA, runtime and renderer smoke, workflow and persona smoke, quality gate, build, sample-audio QA, and `git diff --check` passed. Runtime covers 4/4 dirty/recovery states and 3/3 protected-loss states; schema 17 remains 41/41 playable digital-zero WAVs, 33/33 full mixes with tail content, and 11/11 isolation checks. |
| 2026-07-16 | review_judge | Re-reviewed after the recovery-only fix and approved with no blocking, major, or moderate findings. Candidate parsing precedes confirmation; cancellation returns before playback, history, identity, project, or recovery mutation; all Open surfaces share the load path. |
| 2026-07-16 | quality_runner | Full `npm run release:check` exited 0 after source, sample, live Electron, native/project-file, packaged app, PKG payload, simulated install, privacy, and value-free release-evidence checks. Local release readiness stayed 100%; external distribution remained correctly unclaimed without private credentials and approvals. |
| 2026-07-16 | quality_runner | After packaging cleanup, regenerated schema-17 sample audio: 41/41 WAVs ended at digital zero, 33/33 full mixes retained tail content, and 11/11 isolation checks passed. Beginner and professional WAVs reproduced SHA-256 `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318` and `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`. |
| 2026-07-16 | plan_keeper | Marked implementation, final-code QA, separate review, full release verification, and post-package sample regeneration complete; prepared completion move, evidence refresh, merge, push, and worktree cleanup. |
| 2026-07-16 | plan_keeper | Completion summary refresh passed with latest completed plan `plan-1487`, progress `1481-1490: 7/10`, local release readiness 100%, six fresh completion artifacts, and no stale or missing artifacts; the 10-plan checkpoint is correctly not due. |
