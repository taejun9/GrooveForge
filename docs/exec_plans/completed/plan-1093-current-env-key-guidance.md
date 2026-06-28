# plan-1093-current-env-key-guidance

## Goal

Make `npm run release:next-actions` show value-free guidance for the current env keys that block external distribution.

The current report correctly identifies the four current release-channel placeholder keys, but the operator still has to infer the allowed channel value and safe URL requirements from other artifacts. The next-actions report should keep values private while showing the validation guidance needed to replace those placeholders correctly.

## Scope

- Add value-free guidance for the current release-channel keys to external next-actions JSON, Markdown, and console output.
- Keep current required keys, current placeholder keys, env edit target, and global placeholder counts intact.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate no-env and placeholder-env paths.

## Out of Scope

- Filling private release URLs, support URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected existing distribution key validation and next-actions output.
2. Done: Added current env key guidance fields and report output.
3. Done: Updated docs and QA expectations.
4. Done: Validated no-env, placeholder-env, and QA paths.
5. Done: Moved this plan to completed and created the review mirror; merge, push, branch deletion, and worktree cleanup follow after the plan commit.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` bootstrap path with source evidence missing and current env key guidance count `0`.
- Passed: `npm run verify` with no `.env.distribution.local`; final next-actions smoke selected `npm run release:prepare-env`, reported four current release-channel keys, and surfaced four value-free guidance rows.
- Passed: `npm run release:prepare-env`, creating the ignored placeholder local env scaffold.
- Passed: `npm run release:next-actions` with placeholder env; current action remained release-channel metadata, current placeholder keys were the four release-channel keys, local placeholder keys were `21`, private values were not recorded, and current env key guidance count was `4`.
- Passed: final `npm run verify` with placeholder env; final next-actions smoke reported current env key guidance count `4`, current placeholder keys `4`, local env placeholder keys `21`, and private values recorded `no`.

## Decision Log

- 2026-06-29: Chose value-free guidance rather than examples with real URLs, because release/support/channel values must stay out of committed files and generated reports.
- 2026-06-29: Mirrored existing validator requirements into next-actions guidance: distribution channel must be exactly one of `direct-download`, `private-beta`, or `managed-release`; release, notes, and support URLs must be safe absolute HTTPS URLs with hostnames, no credentials, and no fragments.

## Status

- Completed.
