# plan-1301-squirrel-dyld-launch-report Review

## Summary

Plan 1301 is complete. The current rebuilt macOS app does not reproduce the attached `@rpath/Squirrel.framework/Squirrel` dyld launch crash, and post-package launch paths now reuse the Electron runtime dependency guard before spawning Electron.

## Findings

- No blocking findings.

## Validation Reviewed

- `node --check harness/scripts/run_desktop_adhoc_sign_smoke.mjs`
- `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs`
- `node --check harness/scripts/run_desktop_installed_project_io_smoke.mjs`
- `PYTHONDONTWRITEBYTECODE=1 python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1301-run_qa.pyc', doraise=True)"`
- `git diff --check`
- `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- `npm run build`
- `npm run desktop:package-smoke`
- `npm run desktop:packaged-project-io-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:install-smoke`
- `npm run desktop:installed-project-io-smoke`

## Evidence

- Package smoke reported Electron runtime framework dependencies `3/3` present, `3/3` code-signed, and `3/3` dyld-loadable before hidden packaged app launch.
- Packaged project IO, ad-hoc runtime signing, simulated install, and installed project IO all reported the same `3/3` dyld-loadable Squirrel/ReactiveObjC/Mantle posture.
- Packaged and installed project IO reports now include value-free dyld dependency rows and launch-ready booleans.

## Residual Risk

- The old plan-1278 `.app` path from the attached crash report can still crash if launched directly without rebuilding from current code.
- External distribution remains unclaimed until operator-owned private env values, update feed/channel metadata, Developer ID signing, notarization, Gatekeeper acceptance, manual QA, distribution-channel QA, private-value leak audit, and the external hard gate pass with real local evidence.
