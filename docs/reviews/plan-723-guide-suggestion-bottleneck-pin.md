# Review: plan-723-guide-suggestion-bottleneck-pin

## Status

completed

## Scope Reviewed

- Empty-search Quick Actions guide suggestion bottleneck pinned-state derivation.
- Guide and bottleneck Pin/Unpin controls routed through existing pinned-command handling.
- Guide suggestion card pin-stack styling.
- README, product, quality, and harness expectations for the bottleneck pin control.

## QA

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.

## Findings

No issues found.

## Notes

- The card derives bottleneck pinned state from current pinned action ids and the current `guide-bottleneck-focus` Quick Action.
- Both guide and bottleneck pin controls call the existing Quick Actions pinned-command handler only after explicit clicks.
- The existing guide suggestion, search result ordering, Spotlight Enter behavior, pinned-command limit, recent-command behavior, and command handlers remain unchanged.
- No project schema, save/load, undo/redo, playback, render/export, package, remote AI, account, cloud, analytics, or sampling scope changed.
