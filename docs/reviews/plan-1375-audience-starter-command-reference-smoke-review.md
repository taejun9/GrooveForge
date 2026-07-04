# plan-1375-audience-starter-command-reference-smoke Review

## Summary

Plan 1375 extends the actual Electron launch smoke so the live app proves the Audience Starter Command Reference discovery path. The smoke now opens Command Reference, searches `audience starter`, verifies the Audience Starter row context, and clicks the Spotlight Quick Actions handoff.

## QA

Passed:

- `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- `npm run qa`
- `npm run build`
- `npm run renderer:smoke`
- `npm run desktop:launch-smoke` with approved macOS GUI/AppKit access.
- `npm run desktop:project-io-smoke` with approved macOS GUI/AppKit access.
- `git diff --check`

## Findings

No blocking findings.

## Notes

- The first live Command Reference collector used a React launch-smoke hook and timed out in the hidden Electron window.
- The final approach uses Electron-side DOM clicks and input events against the real app surface: open Command Reference, search Audience Starter, verify row/Spotlight context, and click the Quick Actions handoff.
- The launch smoke palette collector was kept value-free and made lighter by removing unnecessary smoke-only Quick Actions UI state churn while preserving the same route/result evidence.

## Residual Risk

- External distribution remains unclaimed because release-channel metadata, Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, and distribution-channel QA require operator-owned private values and external state.

## Completion

The change improves beginner/professional producer discoverability by proving that users can find Audience Starter from Command Reference and hand off to Quick Actions in the actual desktop app, without changing starter generation, project schema, playback, export files, remote behavior, private values, or sampling scope.
