# plan-1301-squirrel-dyld-launch-report

## Goal

Resolve the attached macOS launch crash report where `GrooveForge.app` aborts before startup because dyld cannot load Electron's `@rpath/Squirrel.framework/Squirrel` runtime dependency.

## Scope

- Verify the current packaged macOS app starts without the attached Squirrel dyld failure.
- Add pre-launch Electron runtime framework dependency guards to launch-bearing packaged flows that did not already check them immediately before spawning the app.
- Keep Squirrel, ReactiveObjC, and Mantle checks value-free and local: presence, rpath resolution, strict code-signature verification, and dyld-loadable posture only.
- Update QA/docs so future work keeps the Squirrel dyld crash inside structured smoke failures instead of user-facing Crash Reporter logs.

## Out of Scope

- Developer ID signing, notarization, Gatekeeper approval, app-store submission, release upload, update feed publication, or external distribution claims.
- Editing private release metadata, local env values, credentials, tokens, or URL values.
- Changing beat-composition workflows, renderer UI, project schema, audio rendering, export artifacts, or product scope.

## Validation

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
- `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Replaced the initial preflight-receipt scope after reading the new attachment. The report is a macOS `Namespace DYLD, Code 1` launch abort for `@rpath/Squirrel.framework/Squirrel` from an older plan-1278 packaged app path.
- 2026-07-03: Current branch package smoke was run with approved unsandboxed GUI/AppKit access and passed: Squirrel, ReactiveObjC, and Mantle were 3/3 present, 3/3 code-signed, 3/3 dyld-loadable, and the hidden packaged app launched successfully.
- 2026-07-03: Added the shared Electron runtime dependency guard to packaged project IO, ad-hoc runtime signing, and installed project IO launch paths so Squirrel/ReactiveObjC/Mantle rpath, presence, strict code-signature, and dyld-loadability are checked before spawning Electron.
- 2026-07-03: Extended packaged and installed project IO Markdown/JSON reports with value-free dyld framework dependency rows and ready booleans so post-package launch evidence records the Squirrel dependency posture without private values.
- 2026-07-03: Verified the full affected macOS launch chain with approved unsandboxed GUI/AppKit access: package smoke, packaged project IO, ad-hoc runtime signing smoke, DMG smoke, simulated install smoke, and installed project IO all reported 3/3 framework dependencies present, 3/3 code-signed, and 3/3 dyld-loadable.

## Completion

- Completed 2026-07-03.
- The current packaged `GrooveForge.app` no longer reproduces the attached Squirrel dyld launch failure when rebuilt from this branch.
- `npm run desktop:packaged-project-io-smoke`, `npm run desktop:adhoc-sign-smoke`, and `npm run desktop:installed-project-io-smoke` now fail before launch if Squirrel, ReactiveObjC, or Mantle are missing, unsigned, or not dyld-loadable through Electron Framework rpaths.
- Final verification covered syntax, static QA, package launch, packaged project IO, runtime ad-hoc signed launch, DMG creation, simulated install launch, and installed project IO.
- External distribution remains unclaimed; Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, and release upload remain outside this plan.
