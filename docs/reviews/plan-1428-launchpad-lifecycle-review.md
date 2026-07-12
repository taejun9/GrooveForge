# plan-1428-launchpad-lifecycle review

## Summary

The project launchpad now starts open with beginner, producer, and existing-project choices, then becomes a compact Start or Switch Project control after a valid project-entry choice. The active project and Guided/Studio context stay visible, and users can reopen the choices at any time.

## QA Evidence

- `npm run qa`: passed.
- `npm run typecheck`: passed.
- `npm run renderer:smoke`: passed with the native disclosure initially open and all three existing actions present.
- `npm run workflow:smoke`: passed for Guided first-beat and Studio fast-pass workflows.
- `npm run persona:smoke`: passed for first-time composer and professional producer paths.
- `npm run build`: passed; the existing nonfatal frontend chunk-size warning remains.
- `npm run desktop:launch-smoke`: passed at 1440×928 with 104 required test IDs, initial open state, starter collapse, identical-starter collapse, manual reopen/close, and screenshot evidence.
- `npm run desktop:project-io-smoke`: passed native save/open, the visible Open button path, launchpad collapse, and both audience starter roundtrips.
- `git diff --check`: passed.

## Findings

Review found that selecting an already-active starter or restoring an identical valid draft could leave the launchpad open because collapse depended on a project-data change. Collapse now follows completion of the valid user choice, independently of reducer changes. The corrected identical-starter path is covered by live Electron evidence.

No blocking findings remain.

## Preservation Checks

- Beginner starter, producer starter, and Open Existing Project retain their existing handlers and test IDs.
- File-dialog cancellation does not call the successful load path, and invalid project text throws before collapse.
- Draft validation still completes before collapse; invalid or absent recovery data does not close the launchpad.
- The controlled native `details`/`summary` remains pointer- and keyboard-activatable and can be reopened or closed manually.
- Launchpad state remains UI-local and is not added to musical project data, saved files, local draft payloads, or exports.
- Starter contents, parsing, playback, rendering, export bytes, and local-first boundaries are unchanged.
- Responsive layout keeps the project title readable and hides only secondary context on narrow screens.

## Residual Risk

Manual launchpad disclosure state resets to open after a fresh app launch by design. The existing large frontend chunk warning remains. The comprehensive desktop smoke is long-running; its aggregate timeout now accommodates the unchanged per-step palette and Command Reference limits without weakening assertions.

## Verdict

Approved. No blocking findings remain.
