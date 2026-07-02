# plan-1287-squirrel-framework-dyld-guard Review

## Summary

The plan closes the attached Squirrel dyld launch-report class by making packaged, PKG payload, and simulated install smokes prove Electron runtime framework loadability before launch. The guard now reads `LC_RPATH` from both the Electron Framework and app executable, records value-free candidate rows, and requires strict code-sign verification for each resolved framework root and framework binary.

## Findings

- No blocking findings.

## Validation Reviewed

- `node --check harness/scripts/desktop_bundle_dependency_guard.mjs`
- `node --check harness/scripts/run_desktop_package_smoke.mjs`
- `node --check harness/scripts/run_desktop_install_smoke.mjs`
- `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs`
- `npm run qa`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:hardened-runtime-readiness-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:pkg-smoke`
- `npm run desktop:pkg-payload-smoke`
- `npm run desktop:install-smoke`
- `npm run verify`
- `git diff --check`

## Residual Risk

- The old app bundle path from the attached crash report can still crash if launched without rebuilding from current `main`; this plan prevents newly generated GrooveForge packages from passing QA with that Squirrel dyld posture.
- External distribution remains unclaimed until operator-owned private env values, update feed/channel metadata, Developer ID signing, notarization, Gatekeeper acceptance, manual QA, distribution-channel QA, private-value leak audit, and `npm run release:external-check` all pass with real local evidence.
