# plan-1094-priority-env-key-guidance

## Goal

Extend `npm run release:next-actions` value-free key guidance beyond the current release-channel action so every priority action with required private env keys shows enough safe guidance for the operator to prepare the next external distribution step.

The current report gives guidance for the four release-channel keys, but later priority actions still list required keys without explaining the safe value shape. This plan keeps private values out while making update feed/channel, Developer ID identity, notarization credentials, and manual QA keys more actionable.

## Scope

- Add value-free guidance for priority action keys outside release-channel metadata.
- Keep the top-level current env key guidance focused on the current action.
- Update Markdown/JSON/console validation so priority action guidance remains value-free and complete for keyed actions.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, no-env, placeholder-env, and QA paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected current priority action required-key coverage and existing guidance output.
2. Done: Added value-free guidance for all required priority-action private env keys.
3. Done: Updated docs and QA expectations.
4. Done: Validated bootstrap, no-env, placeholder-env, and QA paths.
5. Done: Moved this plan to completed and created the review mirror; merge, push, branch deletion, and worktree cleanup follow after the plan commit.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: bootstrap `npm run release:next-actions`; source evidence was missing, current env key guidance count was `0`, and the first action was `npm run release:check`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, kept current release-channel guidance count `4`, and produced priority action guidance coverage with missing key guidance `0` for all keyed actions.
- Passed: no-env JSON inspection: release-channel `4/4`, auto-update `6/6`, Developer ID `1/1`, notarization `9/9`, manual QA `2/2`, final hard gate `22/22`, all with no missing guidance.
- Passed: `npm run release:prepare-env`, creating the ignored placeholder local env scaffold without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current action remained release-channel metadata, current placeholder keys were `4`, local env placeholder keys were `21`, private values recorded was `false`, and priority action guidance coverage had no missing keys.
- Passed: final placeholder-env `npm run verify`; final next-actions smoke reported current env key guidance count `4`, current placeholder keys `4`, local env placeholder keys `21`, private values recorded `no`, and no missing priority guidance rows.

## Decision Log

- 2026-06-29: Chose to keep `currentEnvKeyGuidance` scoped to the current action while expanding each `priorityActions[].keyGuidance` list, so the top-level operator flow stays focused but later steps are still discoverable.
- 2026-06-29: Mirrored existing validators into value-free priority guidance for update feed/channel keys, Developer ID identity selection, notary credential signals, notary submit guard, manual QA approval, and manual QA checklist digest.

## Status

- Completed.
