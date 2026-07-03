# plan-1313-squirrel-framework-launch

## Goal

Fix the macOS launch crash reported for the packaged GrooveForge app where dyld fails to load `@rpath/Squirrel.framework/Squirrel` because the framework is missing from a searched rpath or rejected by code-signing validation.

## Scope

- Inspect the desktop packaging and local ad-hoc signing smokes around Electron nested frameworks.
- Add or update deterministic validation so the packaged app proves `Squirrel.framework` exists at the runtime path Electron uses.
- Add or update signing verification so nested Electron frameworks, including Squirrel, are signed in a loadable state before launch/package artifacts are considered ready.
- Keep the fix local-first and value-free; do not require Developer ID credentials, notarization, Gatekeeper approval, release uploads, update-feed publishing, or private distribution env values.
- Preserve existing product behavior, project schema, audio generation, export semantics, and UI workflow.

## Non-Goals

- Do not edit `.env.distribution.local` or record private release values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion.
- Do not change the Electron version unless investigation proves the current package cannot be repaired safely.
- Do not introduce remote services, analytics, accounts, payments, cloud sync, sampling-first behavior, or imported-audio requirements.

## Validation

- [x] `node --check harness/scripts/desktop_bundle_dependency_guard.mjs`
- [x] `node --check harness/scripts/run_desktop_package_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_dmg_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_installed_project_io_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_install_smoke.mjs`
- [x] `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- [x] `npm run build`
- [x] `npm run desktop:smoke`
- [x] `npm run desktop:package-smoke`
- [x] `npm run desktop:adhoc-sign-smoke`
- [x] `npm run desktop:launch-smoke`
- [x] `npm run desktop:dmg-smoke`
- [x] `npm run desktop:pkg-smoke`
- [x] `npm run desktop:pkg-payload-smoke`
- [x] `npm run desktop:packaged-project-io-smoke`
- [x] `npm run desktop:install-smoke`
- [x] `npm run desktop:installed-project-io-smoke`
- [x] `npm run typecheck`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run release:check`
- [x] `git diff --check`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after reviewing the attached crash report. The crash is a macOS dyld failure for `@rpath/Squirrel.framework/Squirrel`, not a React/runtime app error. The fix should strengthen package/signing verification around Electron nested frameworks before any local artifact is treated as launch-ready.
- 2026-07-03: Added signature-compatibility evidence to the Electron runtime framework dependency guard. Squirrel, ReactiveObjC, and Mantle now must be present, strictly code-signed, signature-compatible with the app bundle, and dyld-loadable before package, ad-hoc signing, DMG, PKG payload, install, and project-IO smokes pass.
- 2026-07-03: Updated `desktop:package-smoke` local launch signing to use the same hardened runtime entitlements path as the dedicated ad-hoc signing smoke, without claiming Developer ID signing or external distribution completion.
- 2026-07-03: Completion evidence refreshed after plan-1313. Latest completed plan is `plan-1313`; current 10-plan progress is `1311-1320: 3/10`; overall completion is `99.999999%` with `0.000001%` remaining. The current first blocker remains `Ignored local distribution env file is not loaded.`, and the operator first command remains `npm run release:prepare-env`.
