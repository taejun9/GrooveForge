# plan-1119-release-doctor-proof-criteria

## Goal

Make `npm run release:doctor` show value-free current action evidence rows and ready criteria, so the operator can see which redacted artifacts and checks prove the active external distribution blocker is cleared.

## Scope

- Add current action evidence rows, evidence labels, and ready criteria to release doctor JSON, Markdown, and console output.
- Keep evidence rows stable and value-free: artifact label, local ignored artifact path, presence, and `valueRecorded: false` only.
- Keep current release-channel placeholder guidance focused on direct proof of the remaining external distribution blocker.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the release doctor proof-criteria contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect release doctor and next-actions proof fields.
2. Add value-free current action evidence rows and ready criteria to release doctor.
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
| 2026-06-29 | Add value-free proof criteria to release doctor instead of editing private env values. | The current blocker is private operator input, so completion progress should improve the proof loop without fabricating external release evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added value-free current action evidence rows, evidence labels, ready criteria, Markdown sections, console summaries, and self-checks to release doctor. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the release doctor proof-criteria contract. |
| 2026-06-29 | quality_runner | Ran syntax check, release doctor no-env and placeholder-env paths, QA, renderer smoke, workflow smoke, typecheck, and diff whitespace checks. |
