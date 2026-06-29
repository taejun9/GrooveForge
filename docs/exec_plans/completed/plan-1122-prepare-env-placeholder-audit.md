# plan-1122-prepare-env-placeholder-audit

## Goal

Make `npm run release:prepare-env` report existing ignored local env placeholder keys and value-free edit locations, so operators can resolve the current release-channel metadata blocker without exposing private values.

## Scope

- Add value-free existing local env placeholder key counts, key names, and file/line edit locations to release prepare-env JSON, Markdown, console output, and validation checks.
- Highlight current release-channel placeholder keys separately from the wider local env placeholder list.
- Keep prepare-env output private-value-free and avoid recording release URLs, support URLs, feeds, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the prepare-env placeholder audit contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect release prepare-env local env parsing and current QA expectations.
2. Add value-free placeholder audit fields to release prepare-env.
3. Update README and QA rule expectations.
4. Run focused prepare-env and repository validation.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Pass: `node --check harness/scripts/run_release_prepare_env.mjs`
- Pass: `npm run release:prepare-env-smoke`
- Pass: `npm run release:prepare-env`
- Pass: `npm run release:doctor`
- Pass: `npm run verify`
- Pass: `npm run qa`
- Pass: `npm run release:next-actions-smoke` (via `npm run verify`)
- Pass: `npm run renderer:smoke` (via `npm run verify`)
- Pass: `npm run workflow:smoke` (via `npm run verify`)
- Pass: `npm run typecheck` (via `npm run verify`)
- Pass: `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add a value-free prepare-env placeholder audit instead of editing private env values. | The current blocker is private release-channel metadata placeholders; prepare-env should guide operators to exact key locations without recording values. |
| 2026-06-29 | Compute the existing local env audit after any requested local env scaffold write. | A first `npm run release:prepare-env` run should show the placeholder keys and file/line rows in the newly created ignored local env file without requiring a second command. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added existing local env and release-channel placeholder audit fields to release prepare-env JSON, Markdown, console output, and self-checks. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the prepare-env placeholder audit contract. |
| 2026-06-29 | quality_runner | Ran syntax check, prepare-env smoke, prepare-env scaffold, release doctor, verify, QA, release next-actions smoke, and diff whitespace checks. |
