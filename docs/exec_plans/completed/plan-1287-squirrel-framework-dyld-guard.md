# plan-1287-squirrel-framework-dyld-guard

## Goal

Close the attached macOS launch report class where `GrooveForge.app` aborts in dyld before startup because `@rpath/Squirrel.framework/Squirrel` cannot be loaded from the packaged Electron framework.

## Scope

- Strengthen the desktop bundle dependency guard so package/install/PKG payload checks record value-free dyld-path evidence for Electron runtime frameworks.
- Verify `@rpath` entries, candidate resolution, framework presence, and strict code-signature status for `Squirrel.framework`, `ReactiveObjC.framework`, and `Mantle.framework` before launch-bearing smoke tests.
- Add focused QA/static coverage so future package work keeps the Squirrel dyld guard active.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, release upload, or external distribution completion.

## Validation

- `node --check harness/scripts/desktop_bundle_dependency_guard.mjs`
- `node --check harness/scripts/run_desktop_package_smoke.mjs`
- `node --check harness/scripts/run_desktop_install_smoke.mjs`
- `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs`
- `npm run build`
- `npm run desktop:smoke`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:hardened-runtime-readiness-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:pkg-smoke`
- `npm run desktop:pkg-payload-smoke`
- `npm run desktop:install-smoke`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-02: Started from the user-provided crash report showing `Termination Reason: Namespace DYLD, Code 1, Library missing` for `@rpath/Squirrel.framework/Squirrel` in `GrooveForge.app` under an older worktree package path. Existing checks cover framework presence and strict signature, but they do not expose the dyld `@rpath` resolution rows that explain why a launch would still fail before JavaScript startup.
- 2026-07-02: Added Electron Framework and app executable `LC_RPATH` parsing. The first stricter attempt only considered Electron Framework `@loader_path/Libraries` and correctly failed package structure validation; dyld also uses the app executable `@executable_path/../Frameworks` runpath, matching the attached report's second attempted Squirrel path.
- 2026-07-02: Wired package, PKG payload, and simulated install smokes to require `allRequiredDependenciesDyldLoadable`, strict framework-root and binary code-sign verification, and value-free candidate rows before launch.

## Completion

- Completed 2026-07-02.
- Packaged, PKG payload, and simulated install paths now record dyld candidate rows from both Electron Framework and app executable `LC_RPATH` sources.
- `Squirrel.framework`, `ReactiveObjC.framework`, and `Mantle.framework` must be referenced, present, framework-signed, binary-signed, and dyld-loadable before launch-bearing smokes continue.
- Final verification reported `Dyld framework loadability: 3/3 loadable via 2 dyld rpaths` for package, PKG payload, and simulated install smoke paths.
- External distribution remains unclaimed; Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, and release upload remain outside this plan.
