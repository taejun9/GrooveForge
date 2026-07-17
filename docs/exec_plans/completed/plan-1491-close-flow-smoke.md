# plan-1491-close-flow-smoke

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Prove in a real Electron process that an actual renderer edit survives the guarded Save-before-close flow, reaches the native project writer, and closes only after the exact current project is durable.

## Evidence and Motivation

Plan 1490 added the production Save-before-close state machine and covered its branches with pure/runtime/source tests. Its residual integration gap is the multi-process roundtrip from a live renderer edit through `beforeunload`, Electron `will-prevent-unload`, the validated Save command, native IPC file output, and the second guarded close. A dedicated smoke can exercise that full path while replacing only the physical OS warning-button click with a deterministic smoke-only Save selection.

## Non-Goals

- Automating or visually asserting the operating-system message-box chrome.
- Bypassing the production renderer close guard, Save completion contract, preload bridge, or native file writer.
- Changing project serialization, audio rendering, file schema, recovery policy, or user-facing close behavior.
- Adding network, cloud, account, analytics, signing, notarization, or external-distribution claims.

## Constraints

- QA completes before separate review.
- The smoke uses the production build, real Electron main/renderer/preload processes, and a process-unique session.
- A live UI mutation must produce an unsaved project before main requests the first close.
- The first close must be prevented by the renderer and observed by main.
- Only the smoke mode substitutes a deterministic `Save and close` choice for the physical native button click; normal runs retain the real message box.
- Save must go through the validated renderer command, context-isolated preload bridge, native IPC handler, and ignored temporary `.grooveforge.json` path.
- The saved bytes must parse and reflect the exact live edit before the renderer asks for the second ordinary close.
- The second close must re-enter the same renderer guard and complete only after exact-current Save cleared dirty/recovery state.
- Evidence remains value-free and local; sample-audio QA and the unrelated plan-085 worktree remain intact.

## Implementation Plan

- [x] Add a narrowly isolated live close-flow smoke mode and structured main-process evidence.
- [x] Add a harness runner, package command, static contracts, and quality/harness documentation.
- [x] Run focused QA, real Electron smoke, sample-audio QA, and final-code QA.
- [x] Run a separate post-QA review and complete the plan/review mirror before the repository merge, push, evidence refresh, and cleanup flow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-17 | Make the live Save-before-close roundtrip the plan-1491 target. | Plan 1490's production path is implemented, but its cross-process end-to-end behavior is not yet exercised by one deterministic integration smoke. |
| 2026-07-17 | Substitute only the OS warning choice in smoke mode. | Electron does not provide a stable API to click a system message-box button, while all safety-critical renderer, IPC, file-write, and second-close behavior can remain production-identical. |
| 2026-07-17 | Require saved content to contain the exact live edit. | A file existing is insufficient evidence that the current renderer snapshot, rather than the starter or a stale snapshot, became durable. |
| 2026-07-17 | Hold smoke-only app lifetime until closed-window evidence is read. | Non-macOS `window-all-closed` can otherwise quit before the asynchronous saved-file verification emits its structured result; activation-driven recreation is suppressed across the same narrow interval. |
| 2026-07-17 | Harden existing live launch waits without weakening assertions. | Two final-release runs reached different 10-second hidden-window UI timeouts after all close-flow checks had passed; 30-second exact modal waits plus timer-based bounded Command Reference polling preserve the required states while accommodating slow GUI hosts. |
| 2026-07-17 | Align every launch-bearing parent timeout with the app's 30-minute budget. | The packaged-app parent still used an obsolete 11-minute limit and terminated a healthy bundled launch before the app could emit its structured result; all four bundled launch runners now wait the documented additional 20 seconds. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-17 | project_lead | Created plan-1491 from clean synchronized main `8c443fe6`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-17 | repo_cartographer | Audited the plan-1490 unload guard, renderer Save-and-close result gate, preload close IPC, native project writer, existing project-I/O smoke, and live-edit UI hooks. The full multi-process roundtrip is feasible with only a smoke-scoped native choice substitution. |
| 2026-07-17 | harness_builder | Added the process-unique hidden close-flow mode, real controlled renderer edit, first-close prevention evidence, smoke-only native Save choice, production command/preload/native-write/exact-current/second-close path, structured ordered result, local harness runner, package sequencing, static contracts, and operator documentation. |
| 2026-07-17 | quality_runner | Static QA, quality gate, typecheck, production build, renderer/desktop-entry/runtime/workflow/persona smokes, and the real macOS Electron close-flow smoke passed. The live smoke proved all eight required ordered events, one native write, exact edited-title bytes, one renderer close request, and successful second guarded close. |
| 2026-07-17 | quality_runner | Sample-audio QA regenerated schema-17 output and decoded 41/41 playable WAVs with 41/41 digital-zero endings, 33/33 full-mix tails, and 11/11 isolation checks. Beginner/professional hashes remained `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318` and `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`. |
| 2026-07-17 | review_judge | Initial post-QA review found a non-macOS automatic-quit race after the window closed but before asynchronous evidence readback. The smoke now suppresses platform quit and activation-driven recreation only until it emits its explicit pass/fail exit; static QA, typecheck, build, desktop entry smoke, and real macOS Electron close-flow smoke passed again after the fix. |
| 2026-07-17 | quality_runner | The first full release check stopped at existing Command Reference Quick Actions handoff readiness after a 10-second hidden-window wait; a standalone rerun stopped at a different existing Quick Actions focus-restore wait. No close-flow, renderer, audio, or project-I/O assertion failed. Added bounded slow-host waits, timer-based Command Reference polling, and explicit handoff-target validation before restarting QA. |
| 2026-07-17 | quality_runner | The hardened source launch passed all 104 required test ids, modal focus, Command Reference handoff, keyboard, and visual evidence. A restarted full release check then passed source launch, project I/O, and close-flow before exposing the packaged runner's obsolete 11-minute parent timeout; aligned package, ad-hoc-sign, PKG-payload, and installed launch parents with the app's 30-minute-plus-20-second contract. |
| 2026-07-17 | quality_runner | Final-code launch coverage passed for source, packaged, ad-hoc-signed, extracted PKG payload, and simulated-installed apps, including packaged/PKG-payload/installed project I/O, DMG, PKG, hardened-runtime readiness, and the guarded close-flow smoke. The remaining Gatekeeper-to-external-completion evidence chain and final resume packet exited 0 without recording private values or making an external-distribution claim. |
| 2026-07-17 | review_judge | Separate post-QA review found no remaining blocking, major, or moderate issue. The physical system warning-button click remains an explicit manual boundary; the live edit, first unload prevention, deterministic smoke-only Save selection, validated renderer command, preload IPC, native writer, exact saved bytes, and second guarded close are automated. |
