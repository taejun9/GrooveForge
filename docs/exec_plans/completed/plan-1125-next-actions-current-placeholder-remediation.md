# plan-1125-next-actions-current-placeholder-remediation

## Goal

Make `npm run release:next-actions` surface a compact value-free remediation checklist for the current release-channel placeholder keys, so the operator can see each current key's file/line, assignment shape, guidance, source artifact, and rerun command without reading multiple sections.

## Scope

- Add current placeholder remediation checklist rows to release next-actions JSON, Markdown, console output, and self-checks.
- Derive rows only from current action data and release doctor prepare-env audit evidence.
- Keep rows value-free: no release URLs, support URLs, feed URLs, credentials, tokens, channel values, Developer ID identity labels, private beats, or real user audio.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, quality rules, and QA expectations for the new checklist contract.

## Out of Scope

- Filling `.env.distribution.local` values.
- Performing external distribution, release upload, remote channel probing, Developer ID signing, Apple notarization submission, Gatekeeper approval, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect next-actions current action data and doctor prepare-env audit fields.
2. Add value-free current placeholder remediation checklist rows and summaries.
3. Update README, quality rules, and QA expectations.
4. Run focused release next-actions checks and repository validation.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`
- Passed: `npm run qa`
- Passed: `npm run release:doctor`
- Passed: `npm run release:prepare-env`
- Passed: `npm run verify`
- Passed: `npm run release:next-actions`
- Passed: `git diff --check`
- Passed: JSON spot-check for `currentPlaceholderRemediationRowCount: 4`, release-channel placeholder locations `.env.distribution.local:10-13`, `sourceArtifact: "Release doctor"`, `nextCommand: "npm run release:doctor"`, and `valueRecorded: false`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add a current-action remediation checklist instead of editing private values. | The remaining release-channel blocker is operator-owned private metadata; the app can improve by making the value-free edit path more explicit. |
| 2026-06-29 | Generate the ignored local env scaffold during QA to verify the loaded-placeholder path. | The new checklist is most important when release-channel placeholder rows exist, so validation needs the 4-row placeholder scenario, not only the missing-env bootstrap scenario. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added current placeholder remediation rows to next-actions JSON, Markdown, console output, and self-checks. |
| 2026-06-29 | repo_cartographer | Updated README, release readiness, harness architecture, quality rules, and QA expectations for the new checklist contract. |
| 2026-06-29 | quality_runner | Ran focused checks, full verify, operator next-actions, and JSON redaction spot-checks. |
