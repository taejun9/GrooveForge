# plan-1081-release-env-scaffold-guidance

## Goal

Improve the generated `.env.distribution.local` scaffold so an operator can fill the remaining external distribution inputs with fewer mistakes and without recording private values.

The local app and release evidence are complete, but external distribution is still blocked by operator-owned channel metadata, update feed metadata, Developer ID identity, notary credentials, and manual QA approval. The scaffold should clearly explain required groups, alternatives, and rerun commands while keeping all real values local and ignored.

## Scope

- Improve `release:prepare-env` scaffold comments and grouping.
- Preserve value-free smoke behavior and the explicit write-local behavior.
- Update docs and QA expectations for the guided scaffold.
- Verify the scaffold still includes the current manual QA checklist digest when evidence exists and does not write root `.env.distribution.local` in smoke mode.

## Out of Scope

- Filling real private values, credentials, URLs, identity labels, tokens, or channel metadata.
- Developer ID signing, notarization, stapling, Gatekeeper approval, release upload, update feed publish, remote probing, manual QA approval, or claiming external distribution completion.
- Replacing `release:external-preflight` or `release:external-check`.
- Changing product scope, direct-composition-first behavior, sampler/import features, project data, or app UI behavior.

## Plan

1. Completed: Created the active plan and inspected prepare-env scaffold rendering.
2. Completed: Implemented grouped scaffold guidance for distribution metadata, manual QA, update feed/channel, Developer ID signing, and notarization.
3. Completed: Updated docs and QA expectations for the guided scaffold.
4. Completed: Ran targeted QA, release prepare-env/doctor validation, and full verification.
5. Completed: Reviewed the change, moved this plan to completed, and created the review mirror.

## QA

- Passed: `node --check harness/scripts/run_release_prepare_env.mjs`
- Passed: `git diff --check`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run release:prepare-env-smoke`
- Passed: `npm run release:doctor`
- Passed: `npm run verify`
- Checked: generated scaffold reports 5 guidance sections and includes the current manual QA checklist digest when evidence exists.
- Checked: smoke mode did not write root `.env.distribution.local`.
- Checked: generated reports record no private values and do not claim external distribution completion.

## Decision Log

- 2026-06-29: Chose scaffold guidance instead of committing any values, because the remaining external distribution inputs are private and operator-owned.
- 2026-06-29: Added a grouped rerun sequence that directs operators through `release:doctor`, `release:external-preflight`, and then `release:external-check` only after preflight blockers clear.

## Status

- Completed.
