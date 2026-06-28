# plan-1089-current-operator-action

## Goal

Make `npm run release:next-actions` expose the current operator action alongside the current next command and first blocker.

The report now identifies the next command and first blocker at the top level. Operators still have to inspect action details to see the specific human action text, such as creating the ignored env scaffold or replacing placeholders. The compact status should surface that current operator action without recording private values.

## Scope

- Add top-level scalar current action guidance fields derived from the first priority action.
- Add current operator action and current rerun command to Markdown and console output.
- Validate that the scalar fields mirror the first priority action and remain value-free.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.

## Out of Scope

- Filling private release values, credentials, URLs, tokens, channel metadata, Developer ID identities, or approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspect current next-actions report shape and QA expectations.
2. Done: Add scalar current operator/rerun guidance fields.
3. Done: Update docs and QA expectations.
4. Done: Validate bootstrap, no-env, and placeholder-env next-actions paths plus full local QA.
5. Done: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: bootstrap `npm run release:next-actions` with missing source evidence. It surfaced `currentOperatorAction` and `currentRerunCommand` for regenerating release evidence.
- Passed: `npm run verify`.
- Passed: no-env `npm run release:next-actions-smoke` inside `npm run verify`. It surfaced `currentNextCommand: npm run release:prepare-env`, the missing local env blocker, the prepare-env operator action, and the current rerun command.
- Passed: no-env JSON inspection. The scalar current operator/rerun fields matched the first priority action and recorded no private values.
- Passed: `npm run release:prepare-env`.
- Passed: placeholder-env `npm run release:next-actions`. It preserved `currentNextCommand: npm run release:doctor`, surfaced placeholder replacement as the operator action, and recorded no private values.

## Decision Log

- 2026-06-29: Chose scalar fields derived from the existing first priority action to avoid a second ordering model.
- 2026-06-29: Kept scalar current action guidance limited to command strings, operator action prose, and key names from redacted remediation evidence.

## Status

- Completed.
