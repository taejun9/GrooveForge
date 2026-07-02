# plan-1304-channel-targeted-apply-smoke

## Goal

Prove the current release-channel placeholder clearance path can update only the four release-channel metadata rows in a full ignored distribution env scaffold while preserving unrelated private placeholders.

## Scope

- Add a `release:channel-apply-private-env-targeted-smoke` command.
- Use a synthetic full distribution env scaffold with release-channel placeholders plus unrelated update-feed, Developer ID, notary, and manual QA placeholders.
- Run preflight, apply, and strict release-channel live-check against the synthetic scaffold.
- Verify only `GROOVEFORGE_DISTRIBUTION_CHANNEL`, `GROOVEFORGE_RELEASE_DOWNLOAD_URL`, `GROOVEFORGE_RELEASE_NOTES_URL`, and `GROOVEFORGE_SUPPORT_URL` are changed.
- Write value-free Markdown/JSON artifacts under ignored `build/desktop/`.
- Update docs and QA static expectations.

## Non-Goals

- Do not read or modify the real `.env.distribution.local`.
- Do not record release URL, support URL, channel, update feed, credential, token, Developer ID identity, notary, or manual QA values.
- Do not claim external distribution, auto-update, signing, notarization, Gatekeeper, or manual QA completion.

## Validation

- [x] `node --check harness/scripts/run_release_channel_apply_private_env_targeted_smoke.mjs`
- [x] `npm run release:channel-apply-private-env-targeted-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1303 proved blocked remediation rows. The current real blocker is four release-channel placeholders inside a larger ignored env scaffold, so the next evidence should prove a targeted apply leaves unrelated private placeholders untouched.
- 2026-07-03: Added targeted apply smoke coverage for a synthetic full ignored distribution env scaffold. The smoke verifies preflight is read-only, apply changes exactly the four release-channel keys, unrelated private placeholders remain untouched, strict live-check is ready, and artifacts remain value-free.
