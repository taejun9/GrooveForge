# plan-1290-audience-session-live-palette-smoke Review

Reviewed the production Electron launch-smoke update and the attached Squirrel dyld report follow-up. The launch smoke now collects value-free Audience Session Quick Actions evidence from the production renderer: route-specific search, Enter target spotlight, and execution result evidence for `Enter Guided: First-time composer` and `Enter Studio: Professional producer`. The rendered Quick Actions list is capped for broad palette opens while count text still reports visible, result, matching, and hidden rows.

No blocking findings.

## Scope Check

- The implementation changes the launch-smoke bridge, Quick Actions rendering bounds, smoke assertions, and desktop smoke timeouts only.
- `desktop:package-smoke` verified the current packaged app includes Squirrel, ReactiveObjC, and Mantle framework dependencies, all code-signed and loadable through dyld rpaths.
- `desktop:adhoc-sign-smoke` verified the locally signed packaged app launches with hardened-runtime options; Developer ID, notarization, Gatekeeper approval, auto-update, and external distribution remain unclaimed.
- Project schema, generation, playback, save/load, render/export semantics, network behavior, accounts, analytics, payments, sampling, imported audio, and private release-channel env values were not changed.

## Validation

- `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- `node --check harness/scripts/run_desktop_package_smoke.mjs`
- `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- `node --check harness/scripts/run_desktop_install_smoke.mjs`
- `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs`
- `npm run typecheck`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run renderer:smoke`
- `npm run qa`
- `npm run release:check`
- `npm run release:prepare-env`
- `npm run release:completion-summary-refresh-smoke`

## Residual Risk

- Direct OS mouse/keyboard click sequencing inside the hidden Electron smoke window remains brittle, so the new launch evidence is collected through a launch-smoke-only renderer hook that uses the same Quick Actions search, spotlight, and Audience Session route execution helpers as the UI.
- The attached old app bundle can still fail if it is launched without rebuilding from current code; current generated packages now have package, dyld, and ad-hoc signing smoke coverage for that Squirrel framework class.
- External distribution remains blocked until the operator replaces the ignored `.env.distribution.local` release-channel placeholders and runs the strict private proof chain.
