# plan-1344-release-channel-clearance-transition-modes

## Goal

Make the release-channel clearance transition evidence useful both before and after the private release-channel metadata is applied. The command should keep the current blocked readout valid, but it should also accept a post-clearance mode where the release-channel keys are ready and the next external blocker has moved to auto-update feed or another downstream release gate.

## Scope

- Update `npm run release:channel-clearance-transition-smoke` so its report distinguishes pre-clearance and post-clearance transition modes without recording private values.
- Add synthetic post-clearance coverage so the after-apply mode is tested without editing ignored local env files or storing release URLs/channel values.
- Preserve the existing pre-clearance blocked behavior for the current real workspace state.
- Update package scripts, harness QA coverage, and release documentation as needed.

## Non-Goals

- Do not edit `.env.distribution.local`, `.env.release-channel.local`, release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or real user audio in the real command path.
- Do not run remote distribution probes, release uploads, update-feed publishing, Apple notarization, Developer ID signing, or the final hard external gate.
- Do not claim auto-update, signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.

## Validation

- [x] `node --check harness/scripts/run_release_channel_clearance_transition_smoke.mjs`
- [x] `npm run release:channel-clearance-transition-post-clearance-smoke`
- [x] `npm run release:channel-clearance-transition-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-04: Created after plan-1343 confirmed the live blocker remains four placeholder release-channel metadata rows. The current transition smoke only proves the real blocked state plus a synthetic clearance preview; this plan makes the same transition evidence survive the moment the release-channel metadata is actually ready and the current blocker advances.
- 2026-07-04: Added the post-clearance smoke mode and kept the real smoke compatible with clean worktrees that still need `npm run release:prepare-env`; completion-summary refresh remained at 99.999999% with external/private release proof pending.
