# plan-1126-next-actions-current-proof-checklist

## Goal

Make `npm run release:next-actions` surface a compact value-free proof checklist for the current action, so each current ready criterion points to the stable evidence rows, proof command, rerun command, and hard external gate without recording private release values.

## Scope

- Add current proof checklist rows to release next-actions JSON, Markdown, console output, and self-checks.
- Derive rows only from current action ready criteria, current evidence rows, current command data, and the hard gate command.
- Keep rows value-free: no release URLs, support URLs, feed URLs, credentials, tokens, channel values, Developer ID identity labels, private beats, or real user audio.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, release readiness, harness architecture, quality rules, and QA expectations for the new checklist contract.

## Out of Scope

- Filling `.env.distribution.local` values.
- Performing external distribution, release upload, remote channel probing, Developer ID signing, Apple notarization submission, Gatekeeper approval, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect current next-actions proof evidence and command summaries.
2. Add value-free current proof checklist rows and summaries.
3. Update README, release readiness, harness architecture, quality rules, and QA expectations.
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
- Passed: JSON spot-check for `currentProofChecklistRowCount: 3`, `currentReadyCriteriaCount: 3`, proof/rerun command `npm run release:doctor`, hard gate `npm run release:external-check`, evidence labels `Distribution private inputs` and `Distribution-channel QA`, `evidenceReady: true`, and `valueRecorded: false`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add a current proof checklist instead of editing private values. | The remaining external blocker is operator-owned proof; next-actions can still reduce ambiguity by tying current ready criteria to value-free evidence and hard-gate commands. |
| 2026-06-29 | Keep the proof checklist scoped to the current action. | The operator needs the immediate proof path for the first blocker; expanding every priority action detail would broaden the contract without helping the next edit. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added current proof checklist rows to next-actions JSON, Markdown, console output, and self-checks. |
| 2026-06-29 | repo_cartographer | Updated README, release readiness, harness architecture, quality rules, and QA expectations for the new proof checklist contract. |
| 2026-06-29 | quality_runner | Ran focused checks, full verify, operator next-actions, and JSON redaction spot-checks. |
