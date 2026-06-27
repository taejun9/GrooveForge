# plan-1027-packaged-desktop-smoke Review

## Summary

Added a packaged desktop smoke gate for the local macOS portable `GrooveForge.app` bundle. The new gate assembles the app under ignored `build/desktop/`, copies built renderer and Electron main/preload artifacts into `Contents/Resources/app`, validates production package metadata, checks app bundle naming and `Info.plist` privacy posture, and launches the packaged app through the existing hidden-window visual launch smoke.

The implementation keeps GrooveForge centered on direct beat composition and does not change project data, playback, audio rendering, export behavior, or optional sampling scope.

## QA

- `git diff --check` passed.
- `node --check harness/scripts/run_desktop_package_smoke.mjs` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run build` passed.
- `npm run desktop:launch-smoke` passed with unsandboxed GUI/process access.
- `npm run desktop:package-smoke` passed with unsandboxed GUI/process access.
- `npm run release:check` passed with unsandboxed GUI/process access.

## Findings

- No blocking findings.
- The package smoke correctly claims only an unsigned local portable app bundle, not installer creation, code signing, notarization, auto-update, app-store submission, or distribution-channel QA.
- The package smoke validates that unused camera, microphone, Bluetooth, audio-capture, and arbitrary-load permission declarations are absent from the packaged app `Info.plist`.

## Residual Risk

- GUI Electron smoke commands require unsandboxed macOS process access in Codex because sandboxed commands cannot open GUI apps reliably.
- The app bundle still uses Electron's default icon and helper app naming; this is acceptable for the local portable smoke but not a final branded installer.
- Signing, notarization, installer format, update channel, and external distribution QA remain unclaimed.

## Follow-Ups

- Select a distribution target before adding DMG/PKG creation, hardened runtime signing, notarization, or update-channel checks.
- Add branded icon/helper metadata during final distribution packaging.
