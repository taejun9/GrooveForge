# plan-1303-channel-preflight-remediation-smoke

## Goal

Add deterministic value-free smoke coverage for the release-channel preflight remediation rows, so the current private release-channel blocker has stronger evidence before any operator-owned values are entered.

## Scope

- Add a `release:channel-apply-private-env-remediation-smoke` command.
- Cover missing ignored env scaffold, missing process env inputs, placeholder process env inputs, and shape-invalid process env inputs using synthetic fixtures only.
- Write value-free Markdown/JSON smoke artifacts under ignored `build/desktop/`.
- Update docs and QA static expectations.

## Non-Goals

- Do not read or modify the real `.env.distribution.local`.
- Do not store or infer release URL, support URL, channel, credential, token, Developer ID identity, or notary values.
- Do not claim external distribution completion.

## Validation

- [x] `node --check harness/scripts/run_release_channel_apply_private_env_remediation_smoke.mjs`
- [x] `npm run release:channel-apply-private-env-remediation-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1302 added preflight remediation rows. The next useful step is to prove blocked remediation classifications deterministically without using real private values.
- 2026-07-03: Added a synthetic remediation smoke that covers missing ignored env scaffold, missing process env values, placeholder process env values, and malformed process env values without reading or modifying the real ignored local env.

## Completion Notes

- Added `npm run release:channel-apply-private-env-remediation-smoke` and included it in `npm run verify`.
- The smoke writes value-free Markdown/JSON artifacts under ignored `build/desktop/` and validates all four blocked remediation branches.
- Docs and QA static expectations now cite the new remediation proof path.
