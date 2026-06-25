# Review: plan-722-guide-suggestion-bottleneck-check

## Status

completed

## Scope Reviewed

- Empty-search Quick Actions guide suggestion bottleneck metric derivation.
- Display-only bottleneck check line and bottleneck metric metadata.
- Guide suggestion card styling for the new check line.
- README, product, quality, and harness expectations for the bottleneck check readout.

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

- The card derives the bottleneck metric and check text from the current `guide-bottleneck-focus` Quick Action detail and existing guide suggestion parsing helpers.
- The existing guide suggestion, search result ordering, Spotlight Enter behavior, pinned-command limit, recent-command behavior, and command handlers remain unchanged.
- No project schema, save/load, undo/redo, playback, render/export, package, remote AI, account, cloud, analytics, or sampling scope changed.
