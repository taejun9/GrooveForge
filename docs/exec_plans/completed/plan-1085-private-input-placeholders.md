# plan-1085-private-input-placeholders

## Goal

Make placeholder-only local distribution env files easier to diagnose without recording private values.

After `npm run release:prepare-env`, operators get an ignored `.env.distribution.local` scaffold. The current private-input checks reject placeholder values, but the Markdown and blocker flow do not clearly summarize which key names are still placeholders. The report should surface placeholder key names and counts so the next release actions are clearer while keeping values out of all committed files and generated reports.

## Scope

- Update `desktop:distribution-private-inputs-smoke` to report local env placeholder key names and counts.
- Add value-free blockers when placeholder keys remain.
- Keep private values, URLs, credentials, tokens, identity labels, channel values, private beats, and user audio out of Markdown/JSON output.
- Update README, release readiness docs, quality rules, and QA expectations.

## Out of Scope

- Filling private values, credentials, URLs, identity labels, tokens, channel metadata, or approval values.
- Developer ID signing, Apple notarization submission, stapling, Gatekeeper approval, release upload, update feed publish, remote probing, manual QA approval, or claiming external distribution completion.
- Changing product scope, direct-composition-first behavior, sampler/import features, project data, or app UI behavior.

## Plan

1. Completed: Confirmed the post-prepare-env placeholder reporting gap.
2. Completed: Implemented redacted placeholder key reporting in private-inputs evidence.
3. Completed: Updated docs and QA expectations.
4. Completed: Ran targeted QA and placeholder-path validation.
5. In progress: Review is complete; moving this plan to completed, creating review mirror, merging to `main`, pushing, deleting the branch, and removing the worktree remain.

## QA

- Passed: `node --check harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:prepare-env`.
- Passed: `npm run desktop:distribution-private-inputs-smoke`.
- Verified generated distribution private-inputs JSON reports `localEnvInput.enabled: true`, `localEnvPlaceholderKeyCount: 22`, `privateValuesRecorded: false`, `localEnvValueRecorded: false`, and a placeholder-key blocker without recording values.
- Passed: `npm run verify`.
- Passed after full verify: `git diff --check`.
- Passed after full verify: `python3 -B harness/scripts/run_qa.py`.

## Decision Log

- 2026-06-29: Chose key-name-only placeholder reporting because operators need concrete next edits, but values must never be recorded.
- 2026-06-29: Review found no value-recording regression; the new blocker and report section use only loader placeholder key names.

## Status

- Review complete; ready for completion move.
