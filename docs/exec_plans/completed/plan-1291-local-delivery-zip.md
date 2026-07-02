# plan-1291-local-delivery-zip

## Goal

Add value-free local delivery ZIP smoke coverage so a first-time composer or working producer can verify the sample-free project package as one transferable archive, not only as a folder of separate files.

## Scope

- Add a desktop local delivery ZIP smoke that runs after the existing local delivery package and package reopen smokes.
- Create an ignored ZIP archive containing the generated project JSON, full mix WAV, four stem WAVs, arrangement MIDI, Handoff Sheet, and local package manifests.
- Verify ZIP entries, CRC-32 checksums, compressed/uncompressed sizes, local headers, central directory records, and EOCD metadata without extracting to user locations.
- Keep private values, real user audio, imported audio, network access, signing, notarization, release upload, and external distribution claims out of scope.
- Update package scripts, QA command catalogs, and durable harness docs so the ZIP smoke stays part of the local verification chain.
- Fix the release-check project IO timeout path found while refreshing completion evidence by aligning native, packaged, PKG payload, and installed project IO smoke timeouts with the launch smoke budget.

## Out of Scope

- Editing `.env.distribution.local` or replacing release-channel placeholders.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion.
- Changing renderer export handlers, audio synthesis, project schema, or optional sampling scope.

## Validation

- `node --check harness/scripts/run_desktop_local_delivery_zip_smoke.mjs` passed.
- `python3 -m py_compile harness/scripts/run_qa.py` passed.
- `npm run desktop:local-delivery-package-smoke` passed.
- `npm run desktop:local-package-reopen-smoke` passed.
- `npm run desktop:local-delivery-zip-smoke` passed, writing a 10-entry ignored ZIP archive and verifying EOCD, central directory, local headers, CRC-32, byte sizes, entry names, and source SHA-256 matches.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `node --check harness/scripts/run_desktop_project_io_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_packaged_project_io_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_pkg_payload_project_io_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_installed_project_io_smoke.mjs` passed.
- `npm run build` passed after the Electron main timeout fix.
- `npm run desktop:project-io-smoke` passed after the timeout fix.
- `npm run release:check` passed with unsandboxed GUI/AppKit access.
- `npm run release:completion-summary-refresh-smoke` passed.

## Decision Log

- 2026-07-02: Created after the external/private release-channel blocker remained unchanged but a product-level follow-up was still available: making local beat handoff easier to verify as a single archive.
- 2026-07-02: Completed after the local package, package reopen, ZIP smoke, QA, typecheck, and quality gate all passed without recording private values or claiming external distribution completion.
- 2026-07-02: During completion refresh, sandboxed `release:check` correctly stopped at the GUI/AppKit guard and the unsandboxed rerun exposed a project IO timeout before renderer completion. Increased Electron project IO timeout to match launch smoke and increased native/packaged/PKG payload/installed harness timeouts to 210 seconds; subsequent project IO smoke and full `release:check` passed.
