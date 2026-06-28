# plan-1091-current-env-edit-target

## Goal

Make `npm run release:next-actions` surface the current ignored local distribution env edit target so operators know exactly which value-free local scaffold file to edit after `npm run release:prepare-env`.

The current compact status can report that placeholder keys remain, but it only says "ignored local distribution env file" in prose. The report should expose a stable path field and status line for the edit target without recording private values.

## Scope

- Add value-free current/local env edit target fields to the external next-actions JSON report.
- Add the edit target to Markdown and console output.
- Validate no-env and placeholder-env release-channel paths.
- Update README, release readiness docs, quality rules, architecture docs, and QA expectations.

## Out of Scope

- Filling private release values, URLs, credentials, tokens, channel metadata, Developer ID identities, notary credentials, or manual approval values.
- Developer ID signing, notarization, Gatekeeper approval, release upload, remote feed probing, manual QA approval, or external distribution completion claims.
- Product UI, audio engine, project schema, sampling, or export behavior changes.

## Plan

1. Completed: Inspect existing env loader and prepare-env path handling.
2. Completed: Add current env edit target fields and compact output.
3. Completed: Update docs and QA expectations.
4. Completed: Validate no-env, placeholder-env, and full local QA paths.
5. Completed: Review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs && node --check harness/scripts/run_release_doctor.mjs && node --check harness/scripts/run_release_external_preflight.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` in source-missing/bootstrap mode; console reported `Current env edit target: .env.distribution.local` without recording private values.
- Passed: final no-env `npm run verify`; release next-actions smoke reported `Current env edit target: .env.distribution.local` and the operator action created the scaffold at `.env.distribution.local`.
- Passed: no-env JSON inspection confirmed `currentEnvEditTarget: .env.distribution.local`, `currentEnvConfiguredFileKey: GROOVEFORGE_DISTRIBUTION_ENV_FILE`, `privateValuesRecorded: false`, and `localEnvValueRecorded: false`.
- Passed: `npm run release:prepare-env`; it created an ignored placeholder `.env.distribution.local` scaffold without recording values.
- Passed: placeholder-env `npm run release:next-actions`; console reported `Current env edit target: .env.distribution.local` and `Replace placeholder values in .env.distribution.local...`.
- Passed: placeholder-env JSON inspection confirmed `localEnvFilesChecked: [".env.distribution.local"]`, `localEnvPresentFiles: [".env.distribution.local"]`, `localEnvPlaceholderKeyCount: 21`, `privateValuesRecorded: false`, and `localEnvValueRecorded: false`.
- Passed: final `node --check harness/scripts/run_release_next_actions.mjs && node --check harness/scripts/run_release_doctor.mjs && node --check harness/scripts/run_release_external_preflight.mjs`.
- Passed: final `git diff --check`.
- Passed: final `python3 -B harness/scripts/run_qa.py`.

## Decision Log

- 2026-06-29: Chose to expose only the local ignored env scaffold path, not any env values, because the path is operational metadata and the existing redaction rules already reject private value recording.
- 2026-06-29: Chose to propagate `localEnvFilesChecked` and `localEnvPresentFiles` from release doctor through external preflight so next-actions can prefer actual loader evidence over process environment guesses.
- 2026-06-29: Kept absolute custom paths bounded through the same display-path behavior as the local env loader, so root-relative files are shown relatively and outside-root files are reduced to basename.

## Status

- Completed.
