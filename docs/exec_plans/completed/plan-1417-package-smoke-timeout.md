# plan-1417-package-smoke-timeout

## Goal

Restore a clean full verification run by fixing the reproducible packaged Electron launch smoke timeout.

## Scope

- Reproduce and diagnose `npm run desktop:package-smoke` in an approved macOS GUI environment.
- Fix the packaged launch harness or application launch behavior responsible for the missing smoke result.
- Preserve the existing package, signing, privacy, and visual-evidence checks.
- Run targeted validation followed by the documented QA and full verification gates.

## Out of Scope

- Product feature changes, release-channel private values, external distribution, Developer ID signing, notarization, analytics, payments, cloud sync, or sampling-first scope.
- Weakening package structure, signature, visual, or privacy assertions to make the smoke pass.

## Decision Log

- 2026-07-11: Started after `npm run verify` reached `desktop:package-smoke` and timed out waiting for the packaged app to exit; an approved direct rerun reproduced the same 210-second launch timeout.
- 2026-07-11: Treat the failure as a harness/application lifecycle defect rather than an external release blocker because the unpackaged Electron launch smoke passes in the same approved GUI environment.
- 2026-07-11: Raised the package-smoke parent timeout to 300 seconds. The application owns a 240-second structured launch-smoke timeout, while the package harness was killing it at 210 seconds before either a success result or the application's structured failure could be emitted; the unpackaged wrapper already uses the required 300-second envelope.
- 2026-07-11: Full verification then exposed the same timeout inversion in `desktop:adhoc-sign-smoke`. Audited every wrapper that enables `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE` and aligned the remaining ad-hoc sign, PKG payload, and simulated install wrappers to the same 300-second parent envelope.

## Validation Log

- PASS: `npm run qa`
- PASS: `npm run typecheck`
- PASS: `npm run build`
- PASS: `git diff --check`
- PASS: `npm run desktop:launch-smoke`
- FAIL: `npm run desktop:package-smoke` from `npm run verify` timed out waiting for packaged Electron to exit.
- FAIL: approved direct `npm run desktop:package-smoke` reproduced the timeout.
- PASS: `node --check harness/scripts/run_desktop_package_smoke.mjs`
- PASS: post-fix `npm run qa`
- PASS: post-fix `npm run build`
- PASS: post-fix `git diff --check`
- PASS: approved post-fix `npm run desktop:package-smoke`; the packaged launch completed in roughly 236 seconds and preserved package, ad-hoc signature, framework dependency, privacy, and visual evidence checks.
- FAIL: first post-fix `npm run verify` advanced beyond package and packaged-project-IO checks, then `desktop:adhoc-sign-smoke` reproduced the same 210-second parent timeout.
- PASS: approved post-fix `npm run desktop:adhoc-sign-smoke`.
- PASS: final `node --check` for all four changed launch wrappers.
- PASS: final `npm run qa`.
- PASS: final `git diff --check`.
- PASS: final `npm run verify`, including package, packaged project IO, ad-hoc signing, DMG, PKG, PKG payload launch, simulated install launch, installed project IO, and the complete release smoke chain.
- PASS: post-completion `npm run qa`.
- PASS: post-completion `git diff --check`.
- PASS: `npm run release:completion-summary-refresh-smoke` with latest completed plan `plan-1417`, current 10-plan progress `1411-1420: 7/10`, user-facing completion `99.999999%`, and remaining completion `0.000001%`.

## Completed Work

- Aligned every parent wrapper that enables `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE` with the existing 300-second outer timeout used by the primary desktop launch smoke.
- Preserved the application's 240-second internal structured timeout and all package, signing, dependency, privacy, visual, project IO, and release assertions.
- Confirmed the formerly failing package, ad-hoc signed app, PKG payload, and simulated install launch paths pass inside the full verification sequence.

## Completion Notes

- The failure was deterministic timing debt: wrappers killed a healthy launch smoke at 210 seconds while the application legitimately completed near 200-236 seconds and owned a 240-second structured timeout.
- Build output retains the existing nonfatal warning for chunks above 500 kB; type checking, production build, QA, and full verification all pass.
- Expected value-free external distribution blockers remain nonfatal smoke states and were not changed by this plan.
