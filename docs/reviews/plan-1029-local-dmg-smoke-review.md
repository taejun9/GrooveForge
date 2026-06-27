# plan-1029-local-dmg-smoke-review

## Summary

Local unsigned DMG smoke is complete. The release gate now creates a macOS UDZO DMG from the validated `GrooveForge.app`, mounts it read-only, verifies `GrooveForge.app` plus an Applications shortcut, checks the mounted app payload and branded metadata, and detaches the image.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_dmg_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:package-smoke`
- Passed: `npm run desktop:dmg-smoke`
- Passed: `npm run release:check`

Electron GUI launch checks and DMG attach/detach checks were run with macOS GUI/process/disk-image access outside the sandbox.

## Findings

No blocking findings after QA.

## Residual Risk

This plan proves a local unsigned macOS DMG artifact only. It still does not claim code signing, notarization, auto-update, app-store submission, or external distribution-channel QA.

## Follow-Ups

- Select a developer identity and distribution channel before adding signing and notarization checks.
- Add update-channel and external install-path QA only after the distribution target is chosen.
