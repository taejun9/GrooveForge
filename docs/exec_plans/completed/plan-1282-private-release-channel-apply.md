# plan-1282-private-release-channel-apply

## Goal

Add a value-free local helper that applies operator-owned release-channel metadata from the current process environment into the ignored local distribution env file, reducing the remaining external distribution blocker without recording URL/channel/private values.

## Scope

- Add an npm command and harness script that reads the four current release-channel metadata keys from process environment, validates allowed channel and safe HTTPS URL shape, writes only to the ignored `.env.distribution.local` or configured `GROOVEFORGE_DISTRIBUTION_ENV_FILE`, and emits redacted Markdown/JSON evidence.
- Add a success smoke that proves placeholder replacement against a synthetic ignored env fixture without reading or modifying the real local env and without recording values.
- Update QA and operator docs so the private apply helper sits before `npm run release:private-edit-strict-proof` in the local operator path.
- Preserve local-first/privacy boundaries: no committed private values, no URL/channel value output, no network probes, no signing/notarization/uploads, and no external distribution claim.

## Validation

- `node --check harness/scripts/run_release_channel_apply_private_env.mjs`
- `node --check harness/scripts/run_release_channel_apply_private_env_success_smoke.mjs`
- `python3 -m py_compile harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `npm run release:channel-apply-private-env-success-smoke`
- `npm run release:prepare-env`
- `npm run verify`

## Decision Log

- 2026-07-02: Started after `plan-1281` made the remaining blocker actionable in completion summaries; the next practical completion step is a redacted local apply helper so real operator-owned metadata can move from shell/private manager into ignored env without manual line edits or evidence leaks.
- 2026-07-02: Added `release:channel-apply-private-env` for the real ignored-env apply path and kept `release:channel-apply-private-env-success-smoke` in `npm run verify` so CI-style validation uses only a synthetic ignored env fixture.
- 2026-07-02: Full `npm run verify` passed, including `desktop:launch-smoke`, packaged app launch, PKG payload launch, simulated install launch, and the new release-channel private env apply success smoke.
