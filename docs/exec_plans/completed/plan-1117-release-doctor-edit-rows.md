# plan-1117-release-doctor-edit-rows

## Goal

Make `npm run release:doctor` show value-free edit locations and edit rows for the current release-channel placeholder action, so the operator can find the exact env lines and assignment shapes without switching tools before rerunning the doctor.

## Scope

- Add current action placeholder edit locations to release doctor JSON, Markdown, and console output.
- Add current action env edit templates and edit rows with key, location, assignment shape, guidance, placeholder status, and `valueRecorded: false`.
- Keep private release values, URLs, credentials, tokens, identity labels, channel values, private beats, and real user audio out of generated artifacts.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the release doctor edit-row contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect release doctor current-action helpers and next-actions edit-row helpers.
2. Add current action edit locations, env edit templates, and edit rows.
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
| 2026-06-29 | Add value-free edit rows to release doctor instead of editing private env values. | The next remaining action is private operator input, so the repo should make the exact edit path clearer without fabricating external evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added value-free current action edit locations, env edit templates, env edit rows, Markdown sections, console summaries, and self-checks to release doctor. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the release doctor edit-row contract. |
| 2026-06-29 | quality_runner | Ran syntax check, release doctor no-env and placeholder-env paths sequentially, QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
