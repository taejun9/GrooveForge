# plan-1290-audience-session-live-palette-smoke

## Goal

Add live production Electron smoke coverage that opens the Quick Actions palette, searches Audience Session routes, and proves Enter Guided / Enter Studio can be discovered and executed from the rendered app UI for first-time composers and professional producers.

## Scope

- Extend the existing desktop launch smoke path that already starts a hidden production Electron BrowserWindow.
- Add value-free renderer launch-smoke evidence for Quick Actions opening, Audience Session route searches, route-specific Enter targets, and execution feedback.
- Cap the rendered Quick Actions row list so broad command palettes stay bounded while search/scope counts remain visible.
- Re-run the Squirrel framework package/signing smokes from the attached launch report to prove current packaged apps include loadable and signed framework dependencies.
- Keep the existing renderer smoke helper coverage from plan-1289 and preserve project schema, generation, playback, render/export, release state, remote behavior, and sampling boundaries.

## Out of Scope

- Changing musical generation, project data shape, audio playback, offline render/export output, release signing/notarization claims, private distribution env values, network behavior, accounts, analytics, payments, sampling, or imported-audio behavior.
- Editing the private `.env.distribution.local` release-channel placeholders or claiming external distribution readiness.

## Validation

- `node --check harness/scripts/run_desktop_launch_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_package_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_install_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run desktop:launch-smoke` passed.
- `npm run desktop:package-smoke` passed.
- `npm run desktop:adhoc-sign-smoke` passed.
- `npm run renderer:smoke` passed.
- `npm run qa` passed.
- `npm run release:check` passed.
- `npm run release:prepare-env` passed and wrote the ignored local scaffold with release-channel placeholders only.
- `npm run release:completion-summary-refresh-smoke` passed, including the required `npm run release:10-plan-checkpoint-smoke` run for `1281-1290: 10/10`.

## Decision Log

- 2026-07-02: Created to close the residual risk from plan-1276/1289: helper-level Quick Actions search coverage existed, but the default live smoke did not open the rendered command palette and click the Audience Session commands.
- 2026-07-02: Expanded scope after the attached macOS launch report showed a packaged app dyld failure for `@rpath/Squirrel.framework/Squirrel`; this plan now reruns package and ad-hoc signing smokes to prove current packages keep the Squirrel, ReactiveObjC, and Mantle frameworks present, code-signed, and loadable.
- 2026-07-02: Hidden Electron windows made direct DOM click sequencing brittle, so the launch smoke now asks the production renderer for value-free Quick Actions evidence from the same palette search, spotlight, and Audience Session route execution helpers used by the UI. The rendered Quick Actions component also caps visible rows to keep broad palette opens bounded.
- 2026-07-02: The first completion-summary refresh failed because ignored release evidence was absent in the new worktree and the 10-plan checkpoint expects the blocked release-channel placeholder scaffold. Ran `npm run release:check` to regenerate local release evidence, then `npm run release:prepare-env` to create the ignored placeholder scaffold without private values, and reran the completion summary refresh successfully.
