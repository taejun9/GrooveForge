# plan-1337-private-input-line-guidance

## Goal

Make release-channel private input preflight reports show value-free file/line guidance for the ignored `.env.release-channel.local` rows, so the current four metadata placeholders can be edited without exposing URL/channel values.

## Scope

- Add private input file location rows to `release:channel-apply-private-env-preflight` and apply reports.
- Include placeholder, missing, and shape-ready booleans plus expected shapes, key names, file names, and line numbers only.
- Update README and QA expectations so the operator-facing report keeps this guidance.

## Non-Goals

- Do not add private release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, beats, or user audio to tracked files or generated reports.
- Do not change allowed channel values, safe URL validation, write semantics, release gate posture, signing, notarization, upload, network probing, app UI, audio generation, project schema, or export behavior.
- Do not claim release-channel metadata, auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA, release upload, or external distribution completion.

## Validation

- [x] `node --check harness/scripts/run_release_channel_apply_private_env.mjs`
- [x] `node --check harness/scripts/run_release_channel_apply_private_env_input_file_smoke.mjs`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `npm run release:prepare-env`
- [x] `npm run release:channel-private-input-template`
- [x] `npm run release:channel-apply-private-env-preflight` expected blocked exit with four placeholder private input file location rows
- [x] `npm run release:channel-apply-private-env-input-file-smoke`
- [x] `npm run release:check` (sandboxed run reached expected macOS GUI restriction; approved unsandboxed rerun passed)
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:completion-summary-smoke`
- [x] Private input file location JSON rows show four value-free rows with file/line guidance and no URL/channel values.
- [x] `git diff --check`

## Decision Log

- 2026-07-04: Created after the main completion summary still showed the real operator preflight blocked by four placeholder private inputs, while the preflight report did not give a dedicated value-free file/line table for the ignored private input file rows.
- 2026-07-04: Added dedicated private input file location rows to the apply/preflight report and input-file smoke, preserving source rows while exposing value-free key, file, line, placeholder, shape, and remediation posture.
- 2026-07-04: The first sandboxed `npm run release:check` stopped at the restricted macOS GUI launch preflight; reran the same command unsandboxed with approval and it completed successfully.
