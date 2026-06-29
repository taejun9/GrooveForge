# plan-1120-release-doctor-completion-gap

## Goal

Make `npm run release:doctor` show a value-free completion gap summary, so completion reports can cite the current proof target, next proof command, hard gate, and claim blockers before any 100% external distribution claim.

## Scope

- Add completion gap status, summary, proof target, first blocker, evidence/criteria summaries, hard-gate command, claim blockers, and no-claim/value-redaction flags to release doctor JSON, Markdown, and console output.
- Keep release doctor output value-free and avoid recording release URLs, support URLs, feeds, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the release doctor completion-gap contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect release doctor and next-actions completion-gap fields.
2. Add value-free completion-gap reporting to release doctor.
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
| 2026-06-29 | Add completion-gap reporting to release doctor instead of editing private env values. | The current blocker is private external distribution proof, so the doctor should explain why completion remains unclaimed without fabricating release evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added value-free completion-gap fields, Markdown section, console summaries, and self-checks to release doctor. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the release doctor completion-gap contract. |
| 2026-06-29 | quality_runner | Ran syntax check, release doctor no-env and placeholder-env paths, QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
