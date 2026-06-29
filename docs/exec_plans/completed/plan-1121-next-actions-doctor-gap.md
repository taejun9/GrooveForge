# plan-1121-next-actions-doctor-gap

## Goal

Make `npm run release:next-actions` carry the release doctor completion-gap proof fields forward, so operator progress reports can cite the doctor-derived proof target, next proof command, hard gate, and claim blockers without claiming external distribution.

## Scope

- Add value-free release doctor completion-gap fields to external next-actions JSON, Markdown, console output, and validation checks.
- Keep next-actions output private-value-free and avoid recording release URLs, support URLs, feeds, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the next-actions doctor completion-gap contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect next-actions and release doctor completion-gap artifacts.
2. Add value-free doctor completion-gap propagation to release next-actions.
3. Update README and QA rule expectations.
4. Run focused release next-actions and repository validation.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Pass: `node --check harness/scripts/run_release_next_actions.mjs`
- Pass: `npm run release:doctor`
- Pass: `npm run release:next-actions`
- Pass: `npm run verify`
- Pass: `npm run qa`
- Pass: `npm run release:next-actions-smoke`
- Pass: `npm run renderer:smoke` (via `npm run verify`)
- Pass: `npm run workflow:smoke` (via `npm run verify`)
- Pass: `npm run typecheck` (via `npm run verify`)
- Pass: `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Propagate release doctor completion-gap evidence through next-actions instead of editing private env values. | The current blocker is still private external distribution proof; next-actions should explain the remaining proof target using existing value-free doctor evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added release doctor completion-gap propagation to external next-actions JSON, Markdown, console output, and validations. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the next-actions doctor completion-gap contract. |
| 2026-06-29 | quality_runner | Ran syntax check, release doctor, release next-actions, verify, QA, release next-actions smoke, and diff whitespace checks. |
