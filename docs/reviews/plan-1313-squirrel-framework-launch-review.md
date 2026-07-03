# plan-1313-squirrel-framework-launch Review

Reviewed the macOS Squirrel framework launch-crash fix across package, ad-hoc signing, DMG, PKG payload, install, and project-IO smokes.

No blocking findings.

## Scope Check

- The attached crash report is handled as a dyld runtime framework dependency failure for `@rpath/Squirrel.framework/Squirrel`.
- The shared Electron dependency guard now records value-free app/dependency signature compatibility booleans.
- Squirrel, ReactiveObjC, and Mantle now must be present, strictly code-signed, signature-compatible with the app bundle, and dyld-loadable through @rpath before launch-bearing artifact smokes pass.
- `desktop:package-smoke` now signs the local launch bundle with hardened runtime entitlements before hidden-window launch.
- The change does not add Developer ID signing, notarization, Gatekeeper approval, network probes, release uploads, private release values, or external distribution claims.

## Validation

- `node --check harness/scripts/desktop_bundle_dependency_guard.mjs`
- `node --check harness/scripts/run_desktop_package_smoke.mjs`
- `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- `node --check harness/scripts/run_desktop_dmg_smoke.mjs`
- `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs`
- `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs`
- `node --check harness/scripts/run_desktop_installed_project_io_smoke.mjs`
- `node --check harness/scripts/run_desktop_install_smoke.mjs`
- `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- `npm run build`
- `npm run desktop:smoke`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:launch-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:pkg-smoke`
- `npm run desktop:pkg-payload-smoke`
- `npm run desktop:packaged-project-io-smoke`
- `npm run desktop:install-smoke`
- `npm run desktop:installed-project-io-smoke`
- `npm run typecheck`
- `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- `npm run release:check`
- `git diff --check`
- `npm run release:completion-summary-refresh-smoke`

## Evidence Notes

- Package, ad-hoc signing, DMG, PKG payload, packaged project IO, install, and installed project IO smokes all reported `3/3 present`, `3/3 code-signed`, `3/3 signature-compatible`, and `3/3 dyld-loadable` for Electron runtime framework dependencies.
- The package, ad-hoc, launch, PKG payload, install, and project-IO smokes all produced live app launch evidence without the Squirrel dyld crash.
- Completion summary refresh reports latest completed plan `plan-1313`, current 10-plan progress `1311-1320: 3/10`, overall completion `99.999999%`, and remaining completion `0.000001%`.

## Residual Risk

- This proves local ad-hoc and local artifact launch readiness only. External distribution still requires operator-owned release-channel values, Developer ID signing, notarization/stapling, notarized Gatekeeper acceptance, auto-update feed proof, and manual distribution QA.
