# plan-1118-release-doctor-command-sequence

## Goal

Make `npm run release:doctor` surface a value-free current command sequence for the active external distribution blocker, so the operator can see the ordered prerequisite, next, and rerun commands without switching to the longer next-actions report.

## Scope

- Add current action prerequisite command and command sequence fields to release doctor JSON, Markdown, and console output.
- Keep current next command, rerun command, env edit target, placeholder locations, edit templates, and edit rows aligned with the current action.
- Keep private release values, URLs, credentials, tokens, identity labels, channel values, private beats, and real user audio out of generated artifacts.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the release doctor command-sequence contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect release doctor current-action helpers and QA expectations.
2. Add value-free current prerequisite command and command sequence reporting.
3. Update README and quality rule expectations.
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
| 2026-06-29 | Add value-free command sequence to release doctor instead of editing private env values. | The remaining blocker requires private operator input, so the repo should make the command flow clearer without fabricating external evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added value-free current action prerequisite command and command sequence fields, Markdown section, console summaries, and self-checks to release doctor. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the release doctor command-sequence contract. |
| 2026-06-29 | quality_runner | Ran syntax check, release doctor no-env and placeholder-env paths, QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
