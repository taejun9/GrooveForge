# plan-1343-release-channel-setup-brief

## Goal

Add a value-free release-channel setup brief that tells an operator whether the ignored private input file exists, which four release-channel metadata keys still need attention, and which preflight/apply/proof commands come next without recording private values.

## Scope

- Add a `npm run release:channel-setup-brief` command for real current-state readouts.
- Add a synthetic `npm run release:channel-setup-brief-smoke` command for QA coverage without reading or modifying real ignored env files.
- Report key names, file names, line numbers, readiness booleans, row counts, and command names only.
- Keep `npm run release:channel-apply-private-env-preflight` as the first operator command and keep `npm run release:channel-setup-wizard` as a guided fallback.
- Update release readiness, harness architecture, and quality command docs.

## Non-Goals

- Do not edit `.env.distribution.local`, `.env.release-channel.local`, release URLs, support URLs, channel values, credentials, tokens, Developer ID identities, or real user audio in the real command path.
- Do not make the guided setup wizard the current first operator command.
- Do not run remote distribution probes, release uploads, Apple notarization, Developer ID signing, update-feed publishing, or the final external hard gate.

## Validation

- [x] `node --check harness/scripts/run_release_channel_setup_brief.mjs`
- [x] `npm run release:channel-setup-brief-smoke`
- [x] `npm run release:channel-setup-brief`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-04: Created after plan-1342 surfaced the proof runner. The current completion blocker is still the four release-channel metadata placeholders; this plan adds a focused value-free brief before the preflight/apply/proof chain so the operator can inspect input-file readiness without exposing private values.
- 2026-07-04: The first completion-summary refresh in the clean worktree failed because ignored desktop/release source evidence was missing. Ran full `npm run verify`, which included the new setup brief smoke and regenerated the ignored evidence set, then reran completion-summary refresh successfully.
- 2026-07-04: Review tightened the synthetic smoke path so `npm run release:channel-setup-brief-smoke` ignores any ambient release-channel process env values and proves only the synthetic placeholder private-input/local-env fixtures.
