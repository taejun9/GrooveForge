# plan-1332-release-channel-template-handoff

## Goal

Surface the value-free release-channel private input template command in the current release completion handoff so the operator can create the ignored `.env.release-channel.local` skeleton before the existing preflight/apply/proof chain.

## Scope

- Add template command/path metadata to value-free release-channel completion and resume evidence.
- Keep the current operator first command as the preflight/apply/proof sequence while exposing the template command as the scaffold step when the private input file is missing.
- Update docs and QA expectations for the new handoff fields.

## Non-Goals

- Do not collect, infer, record, or commit real release URL, support URL, channel, credential, token, Developer ID identity, local env, beat, or user audio values.
- Do not replace the preflight/apply/proof order with the template command.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, or external distribution completion.
- Do not change product UI, audio behavior, project schema, release signing, notarization, uploads, or external release artifacts.

## Validation

- [x] Targeted release-channel edit/completion handoff smokes
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after plan-1331 added the ignored private input template command but the top-level completion summary still resumed directly at `npm run release:channel-apply-private-env-preflight`. The next improvement is to surface the template command and default private input path in the completion handoff while preserving the preflight/apply/proof sequence as the authoritative first validation path.
- 2026-07-03: Added value-free private input template command/path/file-key/preflight-before-apply fields across release-channel edit packets, completion report packets, progress/summary refreshes, external run/resume packets, and the completion summary refresh handoff.
- 2026-07-03: Updated readiness/harness docs and QA expectations so the helper is visible as `npm run release:channel-private-input-template` with default `.env.release-channel.local` while the current operator sequence still starts with the existing env/preflight path.
- 2026-07-03: Regenerated missing local release evidence with `npm run release:check`, then confirmed `npm run release:completion-summary-refresh-smoke` passed with template command/default path mirrored into the external resume packet and no private values recorded.
