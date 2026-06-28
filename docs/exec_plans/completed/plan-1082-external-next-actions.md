# plan-1082-external-next-actions

## Goal

Add a value-free external distribution next-actions artifact so the operator can see the remaining release blockers in an ordered checklist without exposing private URLs, credentials, tokens, identity labels, channel values, private beats, or user audio.

The local app, MVP, package, and preflight evidence are complete. External distribution still depends on operator-owned metadata, Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, and manual QA approval. The next-actions artifact should translate the existing doctor/preflight evidence into an explicit action order that is safe to share.

## Scope

- Add a new release helper script and npm command for external next actions.
- Generate ignored Markdown/JSON artifacts under `build/desktop/`.
- Read existing release doctor, external preflight, remediation, runbook, ledger, and progress artifacts where available.
- Group actions by distribution metadata, update feed/channel, Developer ID, notarization, Gatekeeper, manual QA, and hard gate.
- Record only readiness booleans, key names, artifact paths, commands, and blockers.
- Update README, release readiness docs, harness docs, quality rules, and QA expectations.

## Out of Scope

- Filling real private values, credentials, URLs, identity labels, tokens, channel metadata, or approval values.
- Developer ID signing, Apple notarization submission, stapling, Gatekeeper approval, release upload, update feed publish, remote probing, manual QA approval, or claiming external distribution completion.
- Changing product scope, direct-composition-first behavior, sampler/import features, project data, or app UI behavior.

## Plan

1. Completed: Created the active plan and scoped the next-actions artifact.
2. Completed: Inspected existing release doctor/preflight/remediation/runbook outputs and defined the action model.
3. Completed: Implemented the next-actions script and npm command.
4. Completed: Updated docs and QA expectations.
5. Completed: Ran targeted QA and release helper validation.
6. Completed: Reviewed the change, moved this plan to completed, and created the review mirror.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`
- Passed: `git diff --check`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run verify`
- Passed: `npm run release:next-actions-smoke`
- Passed: `npm run release:next-actions`
- Checked: external next-actions JSON reports `externalNextActionsReady: true`, current focus `Release channel metadata`, local release readiness `100`, priority actions `7`, external distribution ready `false`, hard gate would fail `true`, and no private/source values recorded.
- Checked: generated external next-actions Markdown lists prioritized actions for release channel metadata, auto-update, Developer ID signing, notarization, Gatekeeper, manual QA digest, and the final hard gate.
- Checked: root `.env.distribution.local` was not written.

## Decision Log

- 2026-06-29: Chose a value-free next-actions artifact because the remaining external distribution blockers are operator-owned and should be made easier to complete without committing private values.
- 2026-06-29: Split the command into `release:next-actions` for operators and `release:next-actions-smoke` for release-gate evidence, so `npm run verify` can reuse freshly generated external preflight evidence without duplicating the full preflight loop.

## Status

- Completed.
