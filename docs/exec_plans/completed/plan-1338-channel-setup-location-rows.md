# plan-1338-channel-setup-location-rows

## Goal

Make `npm run release:channel-setup-wizard` report the same value-free private input file location rows as the preflight/apply helper, so guided setup can show which ignored `.env.release-channel.local` rows are missing, placeholder, or shape-invalid without exposing URL/channel values.

## Scope

- Add private input file location rows to the release-channel setup wizard report.
- Mirror row counts, placeholder locations, invalid-shape locations, and missing-key counts in JSON, Markdown, and console output.
- Update quality rules and QA expectations so the guided setup path keeps this operator guidance.

## Non-Goals

- Do not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, beats, or real user audio.
- Do not change allowed channel validation, safe URL validation, apply/write semantics, release gate posture, signing, notarization, upload, network probing, app UI, audio generation, project schema, or export behavior.
- Do not claim release-channel metadata, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA, release upload, or external distribution completion.

## Validation

- [x] `node --check harness/scripts/run_release_channel_setup_wizard.mjs`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `npm run release:channel-setup-wizard-input-file-success-smoke`
- [x] `npm run release:channel-setup-wizard-success-smoke`
- [x] `npm run release:channel-setup-wizard` expected blocked exit with four placeholder private input file location rows when the real ignored private input file still contains placeholders
- [x] `git diff --check`
- [x] `npm run release:check` (sandboxed run reached expected macOS GUI restriction; approved unsandboxed rerun passed)
- [x] `npm run release:prepare-env`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:completion-summary-smoke`

## Decision Log

- 2026-07-04: Created after plan-1337 added private input file location rows to preflight/apply reports, while the guided setup wizard still only exposed input source rows and not the editable private input file row/line remediation table.
- 2026-07-04: Added value-free private input file location rows to the guided setup wizard and required the input-file success smoke to prove four ready file rows with zero placeholders and zero invalid-shape rows.
- 2026-07-04: The first sandboxed `npm run release:check` stopped at the restricted macOS GUI launch preflight; reran the same command unsandboxed with approval and it completed successfully.
