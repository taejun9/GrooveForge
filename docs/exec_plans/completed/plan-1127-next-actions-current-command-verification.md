# plan-1127-next-actions-current-command-verification

## Goal

Make `npm run release:next-actions` surface value-free current command verification rows, so the operator can see each current command's role, expected evidence, proof target, rerun posture, and hard external gate without recording private release values.

## Scope

- Add current command verification rows to release next-actions JSON, Markdown, console output, and self-checks.
- Derive rows only from current command sequence, current action data, current evidence rows, and the hard gate command.
- Keep rows value-free: no release URLs, support URLs, feed URLs, credentials, tokens, channel values, Developer ID identity labels, private beats, or real user audio.
- Preserve the all-genre direct beat workstation posture; sampling remains optional and secondary.
- Update README, release readiness, harness architecture, quality rules, and QA expectations for the new command verification contract.

## Out of Scope

- Filling `.env.distribution.local` values.
- Performing external distribution, release upload, remote channel probing, Developer ID signing, Apple notarization submission, Gatekeeper approval, app-store submission, or manual QA approval.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Completed Work

1. Added current command verification rows to `release:next-actions` JSON, Markdown, console output, and validations.
2. Classified current command sequence entries as prerequisite, proof, rerun, hard-gate, or supporting commands.
3. Connected each row to current evidence labels/paths, proof command, rerun command, hard gate command, and `valueRecorded: false`.
4. Updated README, release readiness, harness architecture, quality rules, and QA expectations for the command verification contract.
5. Confirmed the release-channel placeholder path reports four value-free verification rows: two prerequisites, one proof command, and one rerun command.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`
- Passed: `npm run qa`
- Passed: `npm run release:doctor`
- Passed: `npm run release:prepare-env`
- Passed: `npm run verify`
- Passed: `npm run release:next-actions`
- Passed: `git diff --check`
- Passed: JSON spot-check for current command verification rows.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add current command verification rows instead of editing private values. | The remaining blocker is operator-owned external proof; the app can still reduce ambiguity by making the current command flow and expected redacted evidence explicit. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added value-free current command verification rows and release-channel placeholder validations. |
| 2026-06-29 | quality_runner | Ran QA, release doctor, prepare-env, verify, release next-actions, diff check, and JSON spot-check successfully. |
