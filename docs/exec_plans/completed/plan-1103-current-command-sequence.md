# plan-1103-current-command-sequence

## Goal

Make `npm run release:next-actions` surface a value-free ordered current command sequence that combines the current prerequisite commands, current next command, and current rerun commands so the operator can follow one compact sequence for the active external-distribution blocker.

## Scope

- Add top-level current command sequence count/summary/list fields to the external next-actions JSON.
- Show the current command sequence summary in Markdown and compact console output.
- Keep command sequence reporting value-free, ordered, unique, and aligned with the first priority action.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.
- Validate bootstrap, no-env, and placeholder-env release next-actions paths.

## Out of Scope

- Filling private release URLs, support URLs, update feed URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, checklist digests, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Inspect existing current command summary fields and first priority action data.
2. Add current command sequence fields to JSON, Markdown, console output, and validation.
3. Update docs and QA expectations.
4. Validate bootstrap, no-env, and placeholder-env release next-actions paths.
5. Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: bootstrap `npm run release:next-actions` with missing source evidence; reported command sequence `npm run release:check`, `npm run release:next-actions`.
- Passed: no-env `npm run verify` path with no local env file loaded; reported command sequence `npm run release:prepare-env`, `npm run desktop:distribution-env-template-smoke`, `npm run desktop:distribution-private-inputs-smoke`, `npm run desktop:distribution-channel-qa-smoke`.
- Passed: placeholder-env `npm run release:next-actions` path with ignored local env placeholders; reported command sequence `npm run desktop:distribution-env-template-smoke`, `npm run desktop:distribution-private-inputs-smoke`, `npm run release:doctor`, `npm run desktop:distribution-channel-qa-smoke`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add a single ordered command sequence after adding separate prerequisite and rerun summaries. | Operators still have to mentally combine prerequisite, next, and rerun commands; a value-free ordered sequence reduces ambiguity without requiring private values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added top-level current command sequence count, summary, list, Markdown section, console summary, and validation. |
| 2026-06-29 | quality_runner | Passed bootstrap, no-env verify, and placeholder-env next-actions validation. |
