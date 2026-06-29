# plan-1142-release-current-blocker-refresh

## Goal

Add an operator-facing release current blocker command that refreshes the value-free external release evidence after `.env.distribution.local` changes, then writes the current blocker receipt without requiring a full `npm run release:check`.

## Scope

- Add a non-smoke `npm run release:current-blocker` path.
- Reuse existing release doctor, proof bundle, dry-run external gate, and progress report evidence.
- Keep the command value-free: no private release URLs, support URLs, feed URLs, credentials, identity labels, or local env values may be written to committed files.
- Update QA expectations and user-facing release docs so operators know when to run the smoke versus refresh command.

## Out of Scope

- Filling `.env.distribution.local` with private values.
- Attempting Developer ID signing, notarization, Gatekeeper approval, upload, remote feed probing, payments, analytics, accounts, or app-store submission.
- Changing beat composition workflows, sampling scope, project schema, or desktop package behavior.

## Plan

1. Inspect the current release command chain and evidence dependencies.
2. Add a refresh mode for current blocker evidence.
3. Wire the new command through `package.json`, QA expectations, and docs.
4. Run focused QA plus release current blocker/progress checks.
5. Complete the plan, create the review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `npm run qa` passed.
- `git diff --check` passed.
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs` passed.
- `npm run release:check` passed.
- `npm run release:current-blocker` passed after `npm run release:check` generated source release evidence.
  - Source mode: `refreshed external release evidence`.
  - Refresh commands: 4.
  - Worktree current next command: `npm run release:prepare-env`, because ignored `.env.distribution.local` is not present in this clean worktree.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add a refresh command instead of broadening the smoke command. | Operators need a short command after editing ignored private env values, while `release:current-blocker-smoke` should remain a fast existing-evidence verifier inside `npm run verify`. |
| 2026-06-30 | Require source release evidence before the current blocker refresh advances to the external gate dry-run. | Clean worktrees without ignored build evidence should get clear `npm run release:check` guidance instead of a downstream PKG payload evidence failure. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started after main reported `99.999999%` completion and `1141-1150: 1/10`; current blocker is four release-channel metadata placeholders in `.env.distribution.local`. |
| 2026-06-30 | harness_builder | Added `npm run release:current-blocker` as a refresh path that reruns release doctor, proof bundle, external gate dry-run, and progress smoke before writing the current blocker receipt. |
| 2026-06-30 | quality_runner | Ran QA, syntax, full release check, and the new current blocker refresh command successfully. |
