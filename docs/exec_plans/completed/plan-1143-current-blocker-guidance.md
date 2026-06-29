# plan-1143-current-blocker-guidance

## Goal

Make the redacted external release operator guidance point to `npm run release:current-blocker` as the short refresh command after ignored `.env.distribution.local` edits, so the current blocker evidence chain stays aligned with the new plan-1142 command.

## Scope

- Add `npm run release:current-blocker` to current-action rerun/command-sequence guidance where release evidence is already available.
- Keep bootstrap/no-source states pointed at `npm run release:prepare-env` or `npm run release:check` as appropriate.
- Keep all reports value-free: no private release URLs, support URLs, feed URLs, credentials, identity labels, or local env values may be recorded.
- Update docs and QA expectations for the new guidance contract.

## Out of Scope

- Filling `.env.distribution.local` private values.
- Attempting Developer ID signing, notarization, Gatekeeper approval, upload, remote feed probing, payments, analytics, accounts, app-store submission, or external distribution completion claims.
- Changing beat composition, sampling scope, project schema, or desktop package behavior.

## Plan

1. Inspect current release doctor, next-actions, proof bundle, and current-blocker command guidance fields.
2. Add current-blocker refresh guidance without changing blocker detection or private-value handling.
3. Update docs and QA expectations.
4. Run focused release guidance checks plus QA.
5. Complete the plan, create the review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `node --check harness/scripts/run_release_prepare_env.mjs` passed.
- `node --check harness/scripts/run_release_doctor.mjs` passed.
- `node --check harness/scripts/run_release_next_actions.mjs` passed.
- `npm run release:prepare-env` passed.
- `npm run release:doctor` passed.
  - Current next command remains `npm run release:doctor`.
  - Current action rerun commands now include `npm run release:current-blocker`, `npm run release:doctor`, and `npm run release:next-actions`.
- `npm run desktop:launch-smoke` passed with GUI/AppKit sandbox escalation.
- `npm run release:check` passed with GUI/AppKit sandbox escalation.
- `npm run release:current-blocker` passed after source release evidence existed.
  - Source mode: `refreshed external release evidence`.
  - Refresh commands: 4.
  - Current next command: `npm run release:doctor`.
  - Current first blocker: four release-channel metadata placeholders.
  - Worktree current edit locations: `.env.distribution.local:11`, `.env.distribution.local:12`, `.env.distribution.local:13`, `.env.distribution.local:14`.
  - Overall completion: `99.999999%`.
  - Current 10-plan progress before completing this plan: `1141-1150: 2/10`.
- `npm run qa` passed.
- `git diff --check` passed.
- Post-completion `npm run release:progress-smoke` passed.
  - Overall completion: `99.999999%`.
  - Current 10-plan progress after completing this plan: `1141-1150: 3/10`.
- Post-completion `npm run release:current-blocker-smoke` passed.
  - Overall completion: `99.999999%`.
  - Current 10-plan progress after completing this plan: `1141-1150: 3/10`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Keep `release:doctor` as the current next proof command while adding `release:current-blocker` as the refresh/rerun command. | The doctor remains the targeted diagnostic, while the current-blocker command now regenerates the full value-free evidence chain after private env edits. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started after main release current blocker evidence reported `99.999999%` completion, `1141-1150: 2/10`, and four release-channel metadata placeholders. |
| 2026-06-30 | harness_builder | Added `npm run release:current-blocker` as the first value-free rerun command in release doctor and release next-actions placeholder cleanup guidance while keeping `npm run release:doctor` as the current next proof command. |
| 2026-06-30 | quality_runner | Ran focused syntax checks, release prepare-env, release doctor, desktop launch smoke with GUI escalation, full release check with GUI escalation, release current-blocker refresh, repo QA, and diff check successfully. |
| 2026-06-30 | plan_keeper | Moved the plan to completed, created the review mirror, and confirmed completion progress at `1141-1150: 3/10`. |
