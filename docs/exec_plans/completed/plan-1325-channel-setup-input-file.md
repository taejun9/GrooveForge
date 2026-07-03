# plan-1325-channel-setup-input-file

## Goal

Let `npm run release:channel-setup-wizard` consume the same ignored release-channel private input file supported by the apply helper, so the operator can run the guided setup flow without exporting the four release-channel metadata values into the shell.

## Scope

- Add optional private input-file loading to the release-channel setup wizard for the four release-channel metadata keys.
- Keep `process.env` as the highest-precedence source, then private input file, then interactive prompt.
- Add value-free wizard report fields and rows for private input file presence, configured/default file names, loaded key names, source rows, and source counts.
- Add a synthetic success-smoke mode that proves the wizard can complete from an ignored private input file without real local-env reads/modifications or private value recording.
- Update package scripts, `verify`, QA expectations, README, release readiness docs, and harness architecture docs.

## Non-Goals

- Do not edit real `.env.distribution.local`.
- Do not add committed private values, URL values, channel values, credentials, tokens, signing identities, local env values, private beats, or real user audio.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, release upload, update feed publishing, or external distribution completion.
- Do not change product UI, audio behavior, project schema, signing, notarization, upload behavior, or real release artifacts.

## Validation

- [x] `node --check harness/scripts/run_release_channel_setup_wizard.mjs`
- [x] `npm run release:channel-setup-wizard-input-file-success-smoke`
- [x] `npm run release:channel-setup-wizard-success-smoke`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:check`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after `plan-1324` added private input-file support to the apply helper while `release:channel-setup-wizard` still gathered inputs only from `process.env` or interactive prompts. Extending the wizard keeps the current operator path coherent and reduces friction for the remaining external release-channel metadata blocker without recording private values.
