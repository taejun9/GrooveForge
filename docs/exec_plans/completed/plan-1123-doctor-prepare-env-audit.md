# plan-1123-doctor-prepare-env-audit

## Goal

Make `npm run release:doctor` surface the release prepare-env placeholder audit as value-free top-level evidence, so operators can see the existing local env placeholder posture and release-channel edit locations from the doctor report before claiming external distribution readiness.

## Scope

- Read release prepare-env placeholder audit fields from the generated prepare-env artifact inside release doctor.
- Add value-free prepare-env audit counts, key summaries, file-loaded status, and release-channel edit-location summaries to release doctor JSON, Markdown, console output, and validation checks.
- Keep doctor output private-value-free and avoid recording release URLs, support URLs, feeds, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the doctor prepare-env audit contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect release doctor prepare-env artifact loading and QA expectations.
2. Add value-free prepare-env placeholder audit fields to release doctor.
3. Update README, quality rules, and QA expectations.
4. Run focused release doctor and repository validation.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Pass: `node --check harness/scripts/run_release_doctor.mjs`
- Pass: `npm run release:doctor` without local env present
- Pass: `npm run release:prepare-env`
- Pass: `npm run release:doctor` with local env placeholders present
- Pass: `npm run qa`
- Pass: `npm run verify`
- Pass: `npm run release:next-actions-smoke` (via `npm run verify`)
- Pass: `npm run renderer:smoke` (via `npm run verify`)
- Pass: `npm run workflow:smoke` (via `npm run verify`)
- Pass: `npm run typecheck` (via `npm run verify`)
- Pass: `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Surface prepare-env placeholder audit inside release doctor instead of editing private env values. | The remaining blocker is private external proof; the doctor should consolidate value-free evidence from prepare-env for the operator loop. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added prepare-env placeholder audit fields to release doctor JSON, Markdown, console output, and self-checks. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the doctor prepare-env audit contract. |
| 2026-06-29 | quality_runner | Ran syntax check, release doctor without local env, prepare-env scaffold, release doctor with placeholders, QA, verify, release next-actions smoke, and diff whitespace checks. |
