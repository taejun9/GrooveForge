# plan-1489-unsaved-close-guard

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Prevent an accidental window close or application quit from silently abandoning the current unsaved project or an available local recovery draft.

## Evidence and Motivation

On synchronized main `f4cda27d`, every project edit marks the renderer dirty and normally writes a local recovery record, but neither the renderer nor Electron main process handles `beforeunload` or `will-prevent-unload`. Closing the window or using Cmd+Q therefore exits without an explicit choice. The local recovery draft is useful fallback evidence, but it is not a durable project file and a just-made edit should be synchronously refreshed before the unload decision.

## Non-Goals

- Adding autosave, file versioning, cloud sync, accounts, analytics, or remote persistence.
- Changing project serialization, native Save IPC, the `.grooveforge.json` schema, or audio rendering.
- Adding an asynchronous Save button inside the native close dialog.
- Claiming that renderer-local recovery replaces an explicit project Save.

## Constraints

- QA completes before separate review.
- Clean projects close without a prompt.
- Dirty projects and recovery-only startup state prevent unload until the user explicitly chooses to close.
- A dirty project synchronously refreshes its local recovery record before the close decision.
- The Electron dialog must default and cancel to keeping the window open; only the explicit close choice may override `beforeunload`.
- Browser fallback must use the platform `beforeunload` confirmation contract.
- Existing launch/project-I/O smoke termination must not hang.
- Existing local-first privacy, composition-first product scope, and unrelated plan-085 worktree remain intact.

## Implementation Plan

- [x] Add a dependency-free close-guard decision contract for clean, dirty, recovery-only, and dirty-plus-recovery states.
- [x] Install renderer `beforeunload` protection with synchronous dirty-draft refresh and cleanup-safe event registration.
- [x] Install the Electron `will-prevent-unload` confirmation with conservative default/cancel behavior.
- [x] Add runtime, renderer, desktop-source, and static regressions; update product, architecture, harness, and quality rules.
- [x] Run QA, separate review, sample-audio QA, and full release check; prepare completion refresh, merge/push, main regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-17 | Make unsaved close protection the plan-1489 target. | Current local recovery lowers loss probability but does not give the user an explicit decision before closing or quitting. |
| 2026-07-17 | Use renderer `beforeunload` plus Electron `will-prevent-unload`. | Electron officially recommends the renderer unload boundary and main-process dialog; allowing unload requires `preventDefault()` on `will-prevent-unload`, the inverse of the renderer event. |
| 2026-07-17 | Offer `Keep editing` and explicit close without a durable Save. | An async Save embedded in the synchronous Electron unload decision would add a larger IPC state machine; the scoped guard accurately preserves the current file/recovery distinction. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-17 | project_lead | Created plan-1489 from clean synchronized main `f4cda27d`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-17 | repo_cartographer | Source audit confirmed dirty state and local recovery exist, while Electron 39.8.10 has no renderer or main-process unload guard. Official Electron docs confirm `will-prevent-unload` and its inverted allow-unload semantics. |
| 2026-07-17 | harness_builder | Added four-path close decisions, synchronous current-project recovery refresh, browser `beforeunload`, and an Electron warning whose default and cancel actions keep editing while only the explicit close-without-project-file choice allows unload. |
| 2026-07-17 | quality_runner | Typecheck, static QA, runtime/renderer smoke, beginner/producer workflow and persona smoke, quality gate, build, `git diff --check`, and an approved real-macOS Electron launch smoke passed. Runtime covers 4/4 close states, 3/3 protected states, and 2/2 refresh states; the 104-id live UI matrix and noninteractive smoke exit remain healthy. |
| 2026-07-17 | quality_runner | Sample-audio QA regenerated schema-17 output and decoded 41/41 playable WAVs with 41/41 digital-zero endings, 33/33 full-mix tails, and 11/11 isolation checks; the renderer-only close guard adds no media artifact. |
| 2026-07-17 | review_judge | Separate post-QA review found no blocking, major, or moderate issue across latest-ref draft refresh, recovery-only preservation, clean exit, focused Limiter resolution, Electron's inverted allow-unload semantics, conservative default/cancel behavior, or noninteractive smoke teardown. |
| 2026-07-17 | quality_runner | Full `npm run release:check` exited 0 in the approved macOS GUI environment after source, runtime, 41-WAV sample, live Electron, native/packaged/PKG payload/installed project I/O, DMG/PKG, signing-truth, privacy, and release-evidence checks. |
| 2026-07-17 | quality_runner | Regenerated final post-package schema-17 audio: 41/41 WAVs ended at digital zero, 33/33 full mixes retained tail content, and 11/11 isolation checks passed. Beginner and professional WAV SHA-256 values remained `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318` and `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`. |
| 2026-07-17 | plan_keeper | Marked implementation, final-code QA, separate review, full release verification, and post-package sample regeneration complete; prepared completion evidence refresh, merge, push, main regeneration, and worktree cleanup. |
