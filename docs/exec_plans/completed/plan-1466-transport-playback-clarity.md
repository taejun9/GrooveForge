# plan-1466-transport-playback-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the essential Play/Stop control explain exactly what will be auditioned before activation and confirm the active loop posture during playback. First-time composers should not have to connect a generic `Play` label with a separate selected scope button; working composers should scan Song, Block, Turn, or Pattern target, length or identity, current BPM, and the next Play/Stop action directly from the transport command while retaining the same explicit realtime playback path.

## Evidence and Motivation

Live Browser audit on clean `main` at `b364e4e4` found the direct Play control at 1280×720 measured 79px by 38px and exposed visible/accessibility text only `Play`, `aria-pressed="false"`, and the hover-only title `Play song loop (Space)`. The adjacent selected Song scope explained `All 8 bars`, the position readout explained the cued target, and the setup field showed 82 BPM, but the essential action itself did not carry target, length, or tempo. An explicit click retained the direct button and changed it to `Stop`, active, and pressed while disabling alternate loop scopes, proving the playback behavior is correct but the direct action remains context-poor in both stopped and playing states.

## Non-Goals

- Changing `togglePlayback`, `startRealtimePlayback`, scheduler timing, `onStep`, `onStop`, playback snapshots, controller ownership, error handling, Space shortcut routing, loop-scope selection, loop bounds, transport position readout, metronome, Tap Tempo, Tempo Nudge, project data, undo history, save/load, render, MIDI, or export.
- Adding pause, seek, scrub, count-in, tempo automation, time signatures, recording, audio input, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- Changing Quick Actions execution, Workspace Command Dock behavior, native menus, or project starter routes.

## Constraints

- QA completes before a separate review starts.
- Preserve the native button, existing test id, Play/CircleStop icons, `aria-keyshortcuts`, boolean `aria-pressed`, `togglePlayback` handler, focus behavior, primary styling, and explicit click/Space semantics.
- Show complete Play or Stop vocabulary plus a truthful compact second line for the current Song, Block, Turn, or Pattern loop target; stopped copy previews the target and playing copy confirms that same scope is active.
- Expose a unique state-aware accessible name and title that identify the next action, loop scope, exact target/length, and current project BPM without claiming pause, seek, or a different loop.
- Keep the control at least 112px wide and 38px high, keyboard-focusable, readable, contained, and free of internal/document horizontal overflow without increasing the 298px compact Transport at 1280px or breaking the supported 1180px minimum.
- Renderer and production Electron evidence cover default copy, name, title, pressed state, target detail, dimensions, readability, focusability, containment, and minimum-window layout; Browser proves loop-scope copy changes and actual Play-to-Stop focus/state transition.

## Implementation Plan

- [x] Add a UI-local playback-button presentation derived from existing loop scope, selected target data, BPM, and `isPlaying`.
- [x] Replace generic one-line Play/Stop copy with a contained two-line target/state treatment while retaining icons and handler.
- [x] Add renderer and production Electron regression evidence and update durable product, architecture, and quality contracts.
- [x] Run Browser at 1280px, production Electron at the supported minimum, full QA, and full verify.
- [x] Run a separate post-QA review, complete the plan/review mirror, and merge through the required worktree flow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-15 | Make Transport Play/Stop clarity the plan-1466 target. | Playback is the most essential direct action still exposing only a generic verb while its exact Song/Block/Turn/Pattern target and BPM live in neighboring surfaces or hover text. |
| 2026-07-15 | Keep the existing playback engine and add only a button-local presentation projection. | Scheduler, loop selection, state transitions, Space routing, and position readout already behave correctly; the missing layer is direct action context. |
| 2026-07-15 | Use a 112px two-line header control while leaving the fixed Command Dock one-line. | Two Electron passes showed the compact wide-header allocation still clipped `Song · 8 bars` at 96px and 104px, while the supported 1180px layout allocated 132.75px; 112px keeps the line readable without expanding the Command Dock. |
| 2026-07-15 | Capture native grid-key Undo results directly instead of sending an unrelated Escape key. | Full verification exposed that the smoke recorder could miss its final synthetic separator under GUI load even though Right/Enter/Space and Undo had completed; direct post-command capture tests the intended state without adding a focus-sensitive key. |
| 2026-07-15 | Raise the bounded production Electron launch-smoke budget from about 15 minutes to 30 minutes while keeping the parent timeout 20 seconds longer. | The smoke has independent 2-5 minute budgets for keyboard, starter, modal, command-reference, and visual phases; their sequential worst-case exceeded the former global budget and cut off a healthy run at `collecting-modal-focus`. |
| 2026-07-15 | Approve the post-QA review after one focused correction. | Review found and removed an unrelated Tempo Nudge `min-width` change, then renderer, typecheck, QA, build, and production Electron revalidation passed with the intended Play/Stop scope isolated. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-15 | project_lead | Plan created in a dedicated feature worktree from clean `main` at `b364e4e4`; the unrelated plan-085 worktree and its existing untracked active plan remain untouched. |
| 2026-07-15 | repo_cartographer | Browser at 1280×720 measured the Play control at 79px by 38px with visible/accessibility text `Play`, no explicit aria-label, pressed false, and title `Play song loop (Space)`. Header height was 298px and document overflow was zero. |
| 2026-07-15 | quality_runner | One explicit Play click changed the control to active pressed `Stop` and disabled alternate loop scopes, confirming the existing handler/state boundary. The direct control still exposed only the generic `Stop` name rather than the active loop target or BPM. |
| 2026-07-15 | quality_runner | The first production Electron pass proved the new exact name/title, pressed state, target copy, focusability, containment, and zero overflow. At 1180px the Play control measured 132.75px by 38px and was fully readable with zero internal/document overflow; at 1440px the 96px minimum left the detail 1-2px short, so the minimum was raised to 104px. The pass also found and corrected one stale Electron shortcut-title expectation. |
| 2026-07-15 | quality_runner | The second Electron pass proved the corrected shortcut title and repeated the 1180px result, but the 104px wide-header control still failed only its child-copy width test. The minimum was raised to 112px and explicit label/detail client/scroll-width evidence was added before the next rerun. |
| 2026-07-15 | quality_runner | The third Electron pass isolated the remaining issue to the 1440px wide-header grid: the supported 1180px control remained readable at 132.75px by 38px, while `repeat(4, 1fr)` over the 340px command strip forced the Beginner starter control to 79px and clipped the 62px detail into 44px. The wide command strip now reserves 112px for Play/Stop and grows from 340px to 376px so Actions, Help, and Metronome retain their prior practical width. |
| 2026-07-15 | quality_runner | The fourth Electron pass proved the final Play/Stop contract at both viewports: the Beginner starter measured 112px by 38px with 62/62px client/scroll widths for both lines, while 1180px remained 132.75px by 38px with zero overflow. The later modal-focus phase found one stale dock parity assertion that compared the header's complete two-line text to `Stop`; it now checks the explicit `strong` action line while retaining shared pressed-state checks. |
| 2026-07-15 | quality_runner | The final production Electron rerun passed the full launch lifecycle. It confirmed the 112x38px Beginner control, 132.75x38px supported-minimum control, complete target/BPM semantics, focus and pressed state, shared Dock Play/Stop lifecycle, 298px compact header, 0px minimum-window overflow, modal focus, visual evidence, and all existing dual-audience workstation paths. |
| 2026-07-15 | quality_runner | `npm run qa` and the complete `npm run verify` chain passed with exit code 0 after the final Electron fix. The chain covered renderer/workflow/persona/runtime checks, all 14 styles, native/packaged/PKG payload/installed project IO, Electron launch and visuals, app/DMG/PKG assembly, local signing posture, distribution safety, private-value leak protections, and completion packets without network or external-release claims. |
| 2026-07-15 | quality_runner | Browser validation at 1280x720 confirmed the final 112x38px Play copy and exact target/BPM semantics, then exposed 5px of document overflow that Electron's 1180px layout did not reproduce. The 376px wide command strip exceeded the header once Setup min-content was included, so the strip returned to 340px with explicit 68/68/68/112px essential columns and compact 16px Actions/Help icons; Browser must re-prove zero overflow and readable labels before completion. |
| 2026-07-15 | quality_runner | Final Browser validation at 1280x720 proved 0px document overflow, the unchanged 298px compact header, readable 68x38px Metronome/Actions/Help controls, and a fully readable 112x38px Play control. Song, Block, Turn, and Pattern produced exact live target/length/BPM names and titles; native Play changed to focused `Stop / Song · 8 bars` with `aria-pressed=true`, native Stop restored focused `Play / Song · 8 bars`, `aria-pressed=false`, and `Cued Song`; browser warning/error logs were empty and a final screenshot confirmed the visual hierarchy. |
| 2026-07-15 | quality_runner | A final full-verify rerun after the Browser width correction found two QA-harness reliability failures instead of accepting the earlier pass: one run timed out collecting Audience Starter landing evidence, and an isolated rerun missed the fifth drum-grid `Escape` recorder step. The native grid recorder now captures post-Undo state directly for both drum and note grids, and Audience Starter timeout failures report the exact beginner/producer build, settle, or read stage. |
| 2026-07-15 | quality_runner | The first post-fix Electron run passed keyboard and Starter landing evidence but exhausted the former 15-minute global budget at `collecting-modal-focus`, proving the step budgets and global budget were inconsistent. After aligning the app/parent limits to 30 minutes plus 20 seconds, the production Electron launch smoke passed with exit code 0 across native drum/note keys, starter landing, modal focus, Command Reference, visual capture, the 112x38px Play control, 132.75x38px minimum-window Play control, and zero minimum-window overflow. |
| 2026-07-15 | quality_runner | The authoritative final `npm run verify` rerun passed with exit code 0 after the deterministic keyboard snapshot and timeout-budget fixes. It generated and reopened real mix/stem WAV packages, passed all 14 styles, source/packaged/ad-hoc/PKG-payload/installed Electron launches, native project IO at every delivery boundary, DMG/PKG assembly, value-leak protections, and bounded external-distribution blockers without network or external-release claims. |
| 2026-07-15 | review_judge | Separate post-QA review found one unrelated Tempo Nudge width drift: its `width` and flex basis remained 104px while `min-width` and the renderer expectation had accidentally changed to 112px. The pair was restored to 104px, type declaration indentation was normalized, and the follow-up renderer smoke, typecheck, `npm run qa`, production build, and production Electron launch smoke all passed. No blocking, major, or moderate findings remain. |
