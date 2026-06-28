# plan-1075-local-pkg-smoke-review

## Status

complete

## Scope

Added a local unsigned macOS PKG installer smoke and wired it into the release gate after DMG creation and before simulated install.

## Findings

- No blocking findings.
- The hard external distribution gate still fails as expected because private distribution inputs, distribution-channel QA, auto-update provider/feed readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper acceptance are not externally proven.

## QA

- `git diff --check` passed.
- `node --check harness/scripts/run_desktop_pkg_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_release_manifest_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_release_notes_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_support_artifact_smoke.mjs` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run build` passed.
- `npm run desktop:package-smoke` passed after unsandboxed rerun.
- `npm run desktop:adhoc-sign-smoke` passed.
- `npm run desktop:dmg-smoke` passed.
- `npm run desktop:pkg-smoke` passed.
- `npm run desktop:install-smoke` passed.
- `npm run desktop:release-manifest-smoke` passed.
- `npm run desktop:release-notes-smoke` passed.
- `npm run desktop:support-artifact-smoke` passed.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected until external distribution evidence is supplied.

## Summary

`desktop:pkg-smoke` now creates a local unsigned `GrooveForge-<version>-darwin-<arch>.pkg`, validates `/Applications` install-location metadata, required payload files, PKG bytes, SHA-256 evidence, and value-free/not-claimed posture, then writes ignored Markdown/JSON reports. The release manifest, release notes, support artifact, docs, and QA expectations now include PKG evidence.

## Residual Risk

This proves a local unsigned installer artifact only. It does not prove real `/Applications` installation, Developer ID Installer signing, Developer ID Application signing, notarization, Gatekeeper approval, auto-update, release upload, manual QA approval, app-store submission, or external distribution completion.
