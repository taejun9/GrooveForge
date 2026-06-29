# plan-1100-evidence-row-labels

## Goal

Make external next-actions evidence rows use stable, human-readable artifact labels instead of generic `Evidence 1` / `Evidence 2` fallback names, so the operator can identify the current redacted evidence artifacts without reading path names.

## Scope

- Add stable evidence row labels to external remediation evidence items.
- Keep next-actions evidence rows value-free and path-based.
- Update QA expectations to reject generic evidence fallback labels in priority/current evidence rows.
- Validate no-env and placeholder-env release next-actions paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Done: Inspected existing evidence row sources and label fallbacks.
2. Done: Added stable labels to remediation evidence rows.
3. Done: Updated next-actions validation and QA text expectations.
4. Done: Validated no-env and placeholder-env output.
5. Done: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_desktop_external_remediation_smoke.mjs`.
- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run desktop:external-remediation-smoke`; the remediation JSON now carries stable evidence labels for every remediation group.
- Passed: bootstrap `npm run release:next-actions`; current evidence rows were the six source evidence artifact labels, with no generic `Evidence N` labels and `valueRecorded: false`.
- Passed: no-env `npm run verify`; final next-actions smoke selected `npm run release:prepare-env`, reported current evidence rows `2`, local env file loaded `no`, local release readiness `100.0%`, and no external distribution completion claim.
- Passed: no-env JSON inspection confirmed current release-channel evidence labels `Distribution private inputs` and `Distribution-channel QA`, with `valueRecorded: false`.
- Passed: `npm run release:prepare-env`; ignored `.env.distribution.local` scaffold was written without recording private values.
- Passed: placeholder-env `npm run release:next-actions`; current next command was `npm run release:doctor`, current evidence rows remained `Distribution private inputs` and `Distribution-channel QA`, current env edit rows remained `4`, local env placeholder keys were `21`, and private values were not recorded.
- Passed: placeholder-env JSON inspection confirmed release-channel current and priority evidence rows use stable labels, paths, presence, and `valueRecorded: false`.

## Decision Log

- 2026-06-29: Chose label-only evidence row improvement because it removes ambiguity in the final external distribution operator loop without recording private values or claiming distribution completion.
- 2026-06-29: Kept a filename-derived fallback for older evidence items, but made generic `Evidence N` labels fail next-actions validation.

## Status

- Completed.
