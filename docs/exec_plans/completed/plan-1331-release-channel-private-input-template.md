# plan-1331-release-channel-private-input-template

## Goal

Add a value-free release-channel private input template command so the operator can create the ignored `.env.release-channel.local` scaffold for the four current metadata keys before running the existing preflight/apply/proof chain.

## Scope

- Add a local-only release-channel private input template writer with an isolated smoke mode.
- Expose the template command in package scripts, release docs, and QA expectations.
- Keep the template and receipts value-free: key names, placeholder markers, shape labels, file names, command names, and row counts only.
- Preserve the current command order: preflight, apply, strict proof, current blocker refresh.

## Non-Goals

- Do not collect, infer, record, or commit real release URL, support URL, channel, credential, token, Developer ID identity, local env, beat, or user audio values.
- Do not overwrite an existing ignored private input file unless an explicit force flag is used by the operator.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, or external distribution completion.
- Do not change product UI, audio behavior, project schema, release signing, notarization, uploads, or external release artifacts.

## Validation

- [x] Targeted syntax check for the new harness script
- [x] Targeted release-channel private input template smoke
- [x] Existing release-channel private input preflight blocked smoke
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after plan-1330 surfaced the private input file key/default/operator path in top-level completion reports. The remaining current blocker is still the four release-channel metadata placeholders, so the next improvement is a direct value-free scaffold command for the ignored private input file that feeds the existing preflight/apply/proof chain.
- 2026-07-03: Added `release:channel-private-input-template` and the isolated `release:channel-private-input-template-smoke`, documented the command in release/readiness/quality/harness docs, and included the smoke in `npm run verify` before the private-env apply smokes. Targeted checks, QA, `npm run verify`, and whitespace checks passed before moving the plan to completed.
