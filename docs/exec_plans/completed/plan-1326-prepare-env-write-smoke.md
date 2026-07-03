# plan-1326-prepare-env-write-smoke

## Goal

Prove the first external completion unblock command can create an ignored local distribution env scaffold without touching operator-owned root `.env.distribution.local`, recording private values, or claiming external distribution completion.

## Scope

- Add a synthetic write smoke for `release:prepare-env` that exercises the local-env write branch against an ignored build-scoped target.
- Keep the real operator command `npm run release:prepare-env` as the explicit root `.env.distribution.local` creator.
- Report value-free write target metadata, write status, placeholder key counts, and real-root modification status.
- Add the smoke to `package.json`, `verify`, QA expectations, README, release readiness docs, quality rules, and harness architecture docs.

## Non-Goals

- Do not write or overwrite the real root `.env.distribution.local` during verify.
- Do not add committed private values, URL values, channel values, credentials, tokens, signing identities, local env values, private beats, or real user audio.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, release upload, update feed publishing, or external distribution completion.
- Do not change product UI, audio behavior, project schema, signing, notarization, upload behavior, or real release artifacts.

## Validation

- [x] `node --check harness/scripts/run_release_prepare_env.mjs`
- [x] `npm run release:prepare-env-write-smoke`
- [x] `npm run release:prepare-env-smoke`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:check`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after plan-1325 completed the setup wizard private input-file path. The remaining external completion path still starts with creating the ignored local distribution env scaffold, but `verify` only covered the non-writing prepare-env smoke. A synthetic write smoke keeps that first unblock command covered without modifying real operator-owned local env state.
- 2026-07-03: Full `npm run release:check` passed after rerunning outside the restricted macOS GUI sandbox so the Electron launch smoke could execute in the expected desktop context.
