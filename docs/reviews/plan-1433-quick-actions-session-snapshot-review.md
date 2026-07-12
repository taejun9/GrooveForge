# plan-1433-quick-actions-session-snapshot review

## Summary

One visible Quick Actions opening now owns one current command graph. Search text, scope UI, result strips, pin inspection, and recent inspection reuse that snapshot; closing the palette discards it so the next opening reflects the latest workstation state.

## QA Evidence

- `npm run qa`: passed on the final code.
- `npm run typecheck`: passed on the final code.
- `npm run renderer:smoke`: passed with inactive suppression, first-active factory execution, cached identity reuse without another factory call, close invalidation, fresh reopen construction, and all prior audience command checks.
- `npm run workflow:smoke`: passed the guided 8-bar first beat and studio 26-bar producer fast pass.
- `npm run persona:smoke`: passed both audiences, all 14 styles, local exports, two delivery packages, and package reopen verification.
- `npm run build`: passed; the existing static 515.92 kB Quick Actions chunk warning remains and no bundle-size reduction is claimed.
- `npm run desktop:launch-smoke`: passed at 1440×928 with 104 required test IDs, complete route/search/run evidence, Guided/Studio behavior, and screenshot evidence.
- `npm run desktop:project-io-smoke`: passed native save/open and both audience starter roundtrips.
- `git diff --check`: passed.

## Findings

### Fixed: render-time cache write could survive an interrupted render

The first implementation populated `quickActionSessionRef.current` during render. The final implementation builds the snapshot inside `openQuickActions` before setting visible state, leaving render read-only and preventing an interrupted or retried render from publishing stale cache data.

### Fixed: reopen snapshot could capture the pre-reset scope

The first event-time implementation built before `openQuickActions` reset the visible scope to `All`. Close and Command Reference transitions now normalize query and scope ahead of every later reopen, while Command/Ctrl+K on an already-open palette is a no-op that preserves the active search session.

No blocking findings remain.

## Preservation Checks

- Initial closed state still returns the stable inactive graph and calls no full factory.
- Header button, Command/Ctrl+K, and Command Reference handoff all use `openQuickActions` and create a fresh graph only when transitioning from closed to open.
- Active query and scope changes keep the same graph identity and therefore avoid repeated callback-rich action creation.
- Pin and recent UI state remains separate React state; cache invalidation does not clear pins or recents.
- Quick Action execution closes and invalidates the session before project/result updates; reopening sees the updated project.
- Command Reference transitions clear the session and normalize scope before its handoff can reopen the palette.
- Launch smoke bypasses the session cache so its project-changing route steps retain fresh actions and closures.
- Project schema, history, playback, MIDI, synthesis, rendering, exports, delivery bundles, local-first behavior, and sampling scope are unchanged.

## Residual Risk

The full Quick Actions and helper modules remain statically bundled. This plan improves repeated open-palette interaction work but does not reduce initial module download, parse, or evaluation size. Module-level splitting still needs a measured architecture boundary.

## Verdict

Approved. No blocking findings remain.
