# plan-1084-next-actions-prepare-env

## Goal

Make the external next-actions report point operators to the explicit ignored env scaffold command when private distribution metadata is missing and no local distribution env file is loaded.

The current evidence correctly reports that external distribution is blocked on release channel metadata. However, when no ignored local env file is loaded, the first command shown for that action is the private-inputs smoke. The more useful first command is `npm run release:prepare-env`, because it creates the ignored `.env.distribution.local` scaffold before validation.

## Scope

- Update `run_release_next_actions.mjs` so release channel metadata actions choose `npm run release:prepare-env` as the next command when local env evidence is absent.
- Preserve existing value-free reporting and external-distribution non-claims.
- Keep `release:next-actions-smoke` strict and release-gate compatible.
- Update README, release readiness docs, harness docs, quality rules, and QA expectations.

## Out of Scope

- Filling private values, credentials, URLs, identity labels, tokens, channel metadata, or approval values.
- Developer ID signing, Apple notarization submission, stapling, Gatekeeper approval, release upload, update feed publish, remote probing, manual QA approval, or claiming external distribution completion.
- Changing product scope, direct-composition-first behavior, sampler/import features, project data, or app UI behavior.

## Plan

1. Completed: Confirmed current release evidence and identified the release-channel metadata next-command gap.
2. Completed: Implement next-actions prepare-env routing for missing local env evidence.
3. Completed: Update docs and QA expectations.
4. Completed: Run targeted QA and next-actions validation.
5. Completed: Reviewed the change, moved this plan to completed, and created the review mirror.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` in missing source evidence mode.
- Passed: `npm run verify`.
- Passed: `npm run release:next-actions` after release evidence exists; confirmed first release-channel action uses `npm run release:prepare-env` when `localEnvFileLoaded: false`, with no private/source values recorded.

## Decision Log

- 2026-06-29: Chose to route the first release-channel metadata action to `npm run release:prepare-env` only when the redacted evidence shows no local env file was loaded, because actual private values remain operator-owned and must stay outside committed files.

## Status

- Completed.
