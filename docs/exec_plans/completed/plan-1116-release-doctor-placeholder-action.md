# plan-1116-release-doctor-placeholder-action

## Goal

Make `npm run release:doctor` surface the first actionable placeholder cleanup step, so the operator can see the current env edit target, priority release-channel keys, next verification command, and value-free blocker before trying to prove external distribution readiness.

## Scope

- Add value-free current action fields to the release doctor JSON, Markdown, and console output.
- Prioritize release-channel metadata placeholders before the broader local env placeholder list.
- Keep private values, release URLs, credentials, tokens, Developer ID identity values, private beats, and real user audio out of generated artifacts.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the release doctor current-action contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect the current release doctor report shape and QA expectations.
2. Add current placeholder cleanup action fields and Markdown/console output.
3. Update README and QA rule expectations.
4. Run focused release doctor and repository validation.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Pass: `node --check harness/scripts/run_release_doctor.mjs`
- Pass: `npm run release:doctor`
- Pass: `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/Users/taejungkim/workspace/GITHUB/GrooveForge/.env.distribution.local npm run release:doctor`
- Pass: `npm run qa`
- Pass: `npm run renderer:smoke`
- Pass: `npm run workflow:smoke`
- Pass: `npm run typecheck`
- Pass: `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add current-action guidance to release doctor instead of editing local private env values. | The remaining blocker depends on real external/private inputs, so the committed repo should clarify the exact next proof step without fabricating values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added value-free current action fields, current env edit target, release-channel placeholder focus, Markdown section, console summary, and self-checks to release doctor. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the release doctor current-action contract. |
| 2026-06-29 | quality_runner | Ran syntax check, release doctor no-env and placeholder-env paths, QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
