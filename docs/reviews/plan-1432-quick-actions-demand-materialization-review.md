# plan-1432-quick-actions-demand-materialization review

## Summary

Quick Actions no longer constructs its callback-rich full command graph while the palette is closed. The regular workstation render reuses one empty array; opening the palette or running the explicit launch-smoke audit materializes the complete current command graph.

## QA Evidence

- `npm run qa`: passed.
- `npm run typecheck`: passed.
- `npm run renderer:smoke`: passed with zero inactive factory calls, stable inactive identity, active factory execution, a closed first-render marker, and all existing audience command results/search checks.
- `npm run workflow:smoke`: passed the guided 8-bar first beat and studio 26-bar producer fast pass.
- `npm run persona:smoke`: passed both audiences, all 14 styles, local exports, two delivery packages, and package reopen verification.
- `npm run build`: passed; the existing large frontend chunk warning remains and no bundle-size reduction is claimed.
- `npm run desktop:launch-smoke`: passed at 1440×928 with 104 required test IDs, complete Quick Actions route/search/run evidence, Guided/Studio behavior, and screenshot evidence.
- `npm run desktop:project-io-smoke`: passed native save/open and both audience starter roundtrips.
- `git diff --check`: passed.

## Findings

No blocking findings remain.

## Preservation Checks

- The inactive helper does not evaluate its factory and returns the same empty array identity across renders.
- `quickActionsOpen` is still set by the visible Actions button, Command Reference handoff, and Command/Ctrl+K shortcut before the next render constructs commands.
- Closing the palette does not run pin normalization against the inactive empty array, so session pins and recent results are not cleared.
- Active palette filtering, scope counts, search hints, spotlight, Enter execution, pins, recents, results, and all command handlers receive the same `createQuickActions` output.
- Explicit `launchSmoke` posture still materializes the graph for exhaustive desktop route evidence even when individual smoke steps close the visible palette.
- The shared inactive array is only consumed through non-mutating searches, filters, and component props; no mutation sites exist.
- Project schema, history, playback, MIDI capture, synthesis, rendering, exports, delivery bundles, local-first behavior, and sampling scope are unchanged.

## Residual Risk

The large Quick Actions and helper modules remain statically bundled, so this plan removes repeated closed-palette construction cost but does not reduce download, parse, or module-evaluation size. Safe module-level lazy loading remains a separate measured architecture task.

## Verdict

Approved. No blocking findings remain.
