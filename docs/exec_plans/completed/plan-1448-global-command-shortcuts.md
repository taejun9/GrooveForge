# plan-1448-global-command-shortcuts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Keep the two command-workflow shortcuts globally available while users are editing text or values: Ctrl/Cmd+K opens Quick Actions and Ctrl/Cmd+/ opens Command Reference from workstation inputs and from the opposite modal search, without stealing ordinary text-entry keys.

## Non-Goals

- Enabling undo, redo, save, open, playback, Pattern selection, capture, or delete shortcuts inside editable controls.
- Changing Quick Actions search, selection, command execution, Command Reference filtering, or modal focus trapping.
- Changing project schema, project values, playback, save/load, export, remote behavior, or sampling scope.

## Constraints

- QA completes before a separate review starts.
- Modified command-workflow shortcuts are handled before the editable-target guard; all other shortcuts keep the existing guard.
- Unmodified `?` opens Command Reference only outside editable controls and remains typable inside inputs, textareas, selects, and contenteditable surfaces.
- Opening from a workstation input preserves its value and restores focus to that exact input after Escape.
- Ctrl/Cmd+/ from Quick Actions search and Ctrl/Cmd+K from Command Reference search perform direct modal handoff while preserving the original workstation opener.
- Production Electron evidence uses native modified keyboard input, not synthetic DOM-only dispatch.

## Implementation Plan

- [x] Separate global command-workflow shortcut detection from editable-control shortcut suppression.
- [x] Add a stable workstation editable-field hook and renderer contract coverage.
- [x] Add native Electron evidence for input opening, value preservation, modal handoff, and focus restoration.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Give only modified Quick Actions and Command Reference shortcuts priority over the editable-target guard. | Command workflows are navigation surfaces that should remain reachable during text/value editing; edit, transport, project mutation, and unmodified help keys must continue to respect typing context. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | repo_cartographer | Source audit found `handleDesktopShortcut` returns for every editable target before checking Ctrl/Cmd+K or Ctrl/Cmd+/, preventing both command workflows from workstation fields and opposite-modal search inputs. |
| 2026-07-13 | quality_runner | Native Electron evidence passed editable opening and modal handoff but extended the existing modal focus collector beyond its 180-second bound; increased only that collector to 240 seconds, below the app's 400-second and parent harness's 420-second bounds. |
| 2026-07-13 | harness_builder | Reused the existing Quick Actions selection and both modal focus flows for the new shortcut proof, removing two redundant full command-graph builds while retaining native input coverage. |
| 2026-07-13 | quality_runner | Typecheck, renderer smoke, repository QA, production build, and the optimized native Electron launch smoke passed. |
| 2026-07-13 | quality_runner | Full `npm run verify` passed source, packaged, ad-hoc signed, PKG-extracted, and simulated-installed Electron launches plus native project IO and release/privacy gates. |
| 2026-07-13 | review_judge | Separate post-QA review found no blocking, high, medium, or low findings; shortcut priority, editable guards, modal opener preservation, test timing, and durable docs agree. |
| 2026-07-13 | plan_keeper | Plan completed and moved to `docs/exec_plans/completed/`; completion review mirror created in `docs/reviews/`. |
