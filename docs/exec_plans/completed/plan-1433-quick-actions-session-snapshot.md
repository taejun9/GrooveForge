# plan-1433-quick-actions-session-snapshot

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Keep Quick Actions search, scope changes, pin inspection, and recent-command inspection responsive by materializing one current command graph per visible palette session instead of rebuilding the full graph on every palette-local render.

## Non-Goals

- Removing, reducing, or renaming commands, scopes, pins, recents, results, or Command Reference entries.
- Keeping a command graph after the palette closes or across project-edit sessions.
- Changing project data, undo/redo, playback, MIDI, rendering, exports, delivery bundles, or persistence.
- Claiming static bundle-size, module-evaluation, or cold-start reduction.

## Context Map

- `src/ui/App.tsx`: palette visibility, command construction, session cache, and launch-smoke audit path.
- `src/ui/workstationAppQuickActionPalette.ts`: demand/session materialization helper.
- `harness/scripts/run_renderer_smoke.mjs`: inactive, first-active, cached-active, and reopen lifecycle proof.
- `electron/main.ts`: live search, scope, pin/recent, route, and mode behavior.
- `harness/scripts/run_desktop_launch_smoke.mjs`: exhaustive live desktop regression gate.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Closed palette renders must still skip the full factory.
- The first open must build from the current project and UI state.
- Query, scope, search-result, pin-inspection, and recent-inspection renders must reuse the same session graph.
- Closing must invalidate the session so reopen builds fresh commands.
- Explicit launch smoke must retain its refresh-per-step command audit behavior.
- Preserve test IDs, handlers, local-first behavior, and the sample-free event model.

## Implementation Plan

- [x] Extend demand materialization with an optional active-session snapshot.
- [x] Store the normal visible palette graph in an App ref and invalidate it on close.
- [x] Keep launch smoke uncached so project-changing route steps retain fresh action closures.
- [x] Add pure lifecycle evidence for inactive, active, cached active, close, and reopen behavior.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and confirm the existing static chunk warning is reported without a size-reduction claim.

## Review Plan

Review starts after QA. It checks session freshness, cached identity, stale closure risk, close/reopen invalidation, keyboard/button/Command Reference entry, query/scope/pin/recent behavior, launch-smoke isolation, and project/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Treat one visible Quick Actions opening as a command snapshot session. | Palette-local query, scope, and inspection changes do not edit the beat; rebuilding thousands of callback-rich command records for those renders adds cost without improving command freshness. |
| 2026-07-13 | Invalidate the snapshot whenever the palette closes. | Every reopen must reflect the latest project, transport, selection, MIDI, delivery, and diagnostic state rather than retaining a stale graph across workstation edits. |
| 2026-07-13 | Bypass the session cache in explicit launch-smoke mode. | The exhaustive smoke changes project and route state while auditing commands even when the visible palette is closed, so it requires fresh closures at every audit render. |
| 2026-07-13 | Build the normal session snapshot inside the open event before setting visible state; never write the cache during render. | Event-time capture uses the latest committed state and avoids leaving stale ref data behind if React interrupts or retries a render. |
| 2026-07-13 | Normalize query scope while closing or entering Command Reference, and make an already-open shortcut invocation a no-op. | The next event-time snapshot must see the same `All` scope that its visible palette will show; an active palette should preserve its current query session. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree after plan-1432 removed closed-palette construction cost. |
| 2026-07-13 | repo_cartographer | Audit confirmed `createQuickActions(...)` still runs on every open-palette query, scope, search-result, pin, and recent state render. |
| 2026-07-13 | harness_builder | Extended renderer evidence to prove inactive suppression, first active build, cached identity reuse, close invalidation, and fresh reopen construction. |
| 2026-07-13 | review_judge | First review rejected render-time ref writes; the snapshot now builds in the committed open event before visible state changes. |
| 2026-07-13 | review_judge | Second review found scope metadata could lag reset state; close and Command Reference paths now normalize scope before every later reopen, and an already-open shortcut is a no-op. |
| 2026-07-13 | quality_runner | Final-code QA, typecheck, renderer/workflow/persona smokes, production build, live Electron launch, native project I/O, and diff checks passed after both review fixes. |
| 2026-07-13 | review_judge | Final post-QA review approved the session snapshot with no blocking findings. |

## Completion Notes

- Closed renders still reuse the stable empty graph without invoking the full factory.
- Opening by button, Command/Ctrl+K, or Command Reference handoff captures one current command graph before showing the palette.
- Query, scope, search-result, pin-inspection, and recent-inspection renders reuse that graph identity.
- Closing or entering Command Reference clears the graph, query, and scope so the next reopen builds from current committed state.
- Explicit launch-smoke mode remains uncached for exhaustive state-changing route evidence.
- Review: `docs/reviews/plan-1433-quick-actions-session-snapshot-review.md`.
