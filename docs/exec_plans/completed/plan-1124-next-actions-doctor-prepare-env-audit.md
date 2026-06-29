# plan-1124-next-actions-doctor-prepare-env-audit

## Goal

Make `npm run release:next-actions` carry the release doctor prepare-env placeholder audit forward, so the main operator command can show value-free local env placeholder posture and release-channel file/line edit locations from doctor evidence.

## Scope

- Read release doctor prepare-env placeholder audit fields inside release next-actions.
- Add value-free doctor prepare-env audit counts, key summaries, file-loaded status, and release-channel edit-location summaries to release next-actions JSON, Markdown, console output, and validation checks.
- Keep next-actions output private-value-free and avoid recording release URLs, support URLs, feeds, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the next-actions doctor prepare-env audit contract.

## Out of Scope

- Replacing private `.env.distribution.local` placeholder values.
- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect release next-actions release doctor source handling and QA expectations.
2. Add value-free doctor prepare-env placeholder audit propagation to release next-actions.
3. Update README, quality rules, and QA expectations.
4. Run focused next-actions and repository validation.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`
- Passed: `npm run release:doctor`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Passed: `npm run release:next-actions`
- Passed: `git diff --check`
- Passed: JSON spot-check for `doctorPrepareEnvAuditSourceReady`, placeholder counts, release-channel edit-location count, `doctorPrepareEnvAuditValueRecorded: false`, and `doctorPrepareEnvAuditClaimedExternalDistribution: false`.
- Note: a direct `npm run release:external-preflight` before full local release evidence failed with the expected `Run npm run release:check first when local release evidence is missing or stale.` guidance; `npm run verify` regenerated the evidence and then passed `release:external-preflight` plus `release:next-actions-smoke`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Propagate release doctor prepare-env audit through next-actions instead of editing private env values. | The current blocker is still private release-channel metadata; next-actions should surface the latest value-free doctor evidence for operator action. |
| 2026-06-29 | Keep `release:next-actions-smoke` as the existing-evidence release-gate path and verify it through `npm run verify`. | The strict smoke path should prove the report reads regenerated release evidence instead of silently bootstrapping missing artifacts. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added release doctor prepare-env audit propagation to next-actions JSON, Markdown, console output, and self-checks. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the doctor prepare-env audit contract. |
| 2026-06-29 | quality_runner | Ran focused checks, full verify, operator next-actions, and redaction spot-checks. |
