# plan-1328-resume-input-file-guidance

## Goal

Make the external completion resume and completion summary reports expose the ignored private input-file path/default plus guided setup fallback for the current release-channel placeholder blocker, without recording private values or changing the proof command contract.

## Scope

- Mirror the release-channel private input file key, default file name, current resolved path, presence/loaded-key counts, and guided setup fallback into the external resume packet.
- Surface the same compact input-file/fallback guidance in the completion summary refresh receipt so after-work reports can name the next private-input route without deeper artifact inspection.
- Keep the current operator first command as `npm run release:channel-apply-private-env-preflight` and the proof command as `npm run release:private-edit-strict-proof`.
- Keep all output value-free and do not read, print, write, or commit private URL/channel/credential values.

## Non-Goals

- Do not replace operator-owned release-channel metadata.
- Do not write or overwrite `.env.distribution.local` or `.env.release-channel.local`.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, release upload, update feed publishing, or external distribution completion.
- Do not change product UI, audio behavior, project schema, signing, notarization, upload behavior, or real release artifacts.

## Validation

- [x] Targeted syntax checks for changed harness scripts
- [x] Targeted external resume/summary smoke commands
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:check`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after plan-1327 separated proof refresh from operator start commands. Current evidence shows root `.env.distribution.local` is present but still has four release-channel placeholders, and the next operator route can use process env, the ignored `.env.release-channel.local` input file, or the guided setup wizard. The compact resume/summary receipts should expose that value-free route directly.
- 2026-07-03: Mirrored private input file key/default/path/presence/loaded-key count and guided setup fallback through the blocked preflight smoke, external completion resume packet, and completion summary refresh receipt. In the isolated plan worktree the ignored local env is absent, so the current operator first command is `npm run release:prepare-env`; the resume/summary receipts still expose `GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE`, `.env.release-channel.local`, the isolated missing input-file path, zero loaded keys, and `npm run release:channel-setup-wizard` without recording private values.
