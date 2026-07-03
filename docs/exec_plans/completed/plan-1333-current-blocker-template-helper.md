# plan-1333-current-blocker-template-helper

## Goal

Surface the value-free release-channel private input template helper in the current blocker and next-actions evidence so the operator can see the ignored `.env.release-channel.local` scaffold path from the same receipts that name the active release-channel placeholder blocker.

## Scope

- Add template command/path metadata to `release:current-blocker` and `release:next-actions` evidence.
- Preserve the current operator first command as `npm run release:channel-apply-private-env-preflight` when the ignored distribution env scaffold already exists.
- Keep all new rows value-free: command names, file names, env key names, row counts, and booleans only.
- Update release readiness and QA expectations for the current-blocker/next-actions template helper mirror.

## Non-Goals

- Do not collect, infer, record, or commit real release URL, support URL, channel, credential, token, Developer ID identity, local env, beat, or user audio values.
- Do not replace the preflight/apply/proof order with the template command.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, or external distribution completion.
- Do not change product UI, audio behavior, project schema, release signing, notarization, uploads, or external release artifacts.

## Validation

- [x] Targeted syntax checks: `node --check harness/scripts/run_release_current_blocker_smoke.mjs`, `node --check harness/scripts/run_release_next_actions.mjs`, `python3 -m py_compile harness/scripts/run_qa.py`
- [x] `npm run release:current-blocker-smoke`
- [x] `npm run release:next-actions-smoke`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:check`
- [x] `git diff --check`
- [x] Receipt check: `release-current-blocker` and `external-next-actions` JSON both expose `npm run release:channel-private-input-template`, `.env.release-channel.local`, `GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE`, `releaseChannelPrivateInputTemplateBeforePreflight: true`, `releaseChannelPrivateInputTemplateValueRecorded: false`, six current action handoff rows, and a `Private input template helper` row.

## Decision Log

- 2026-07-04: Created after plan-1332 mirrored the private input template helper into completion summaries and external run/resume packets. The immediate operator receipts for the active blocker, `release:current-blocker` and `release:next-actions`, still do not expose the helper/default path directly, which makes the next private-input step easier to miss.
- 2026-07-04: Implemented the helper mirror in `release:current-blocker` and `release:next-actions`, including the normal missing-env release-channel path where the current first operator command remains `npm run release:prepare-env` while the template helper stays a separate value-free scaffold hint.
- 2026-07-04: Final `npm run release:check` passed under approved unsandboxed GUI/AppKit access after the initial sandboxed run hit the expected restricted Electron launch guard.
