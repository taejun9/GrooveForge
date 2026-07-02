# plan-1297-external-resume-packet-operator-sequence

## Goal

Make the external completion resume packet carry the same value-free Current Operator Command Sequence as the external completion run packet, so resume guidance proves the next resume command matches the current operator first command before any private release-channel values are entered.

## Scope

- Mirror current operator command sequence fields from the external completion run packet into `npm run release:external-completion-resume-packet-smoke`.
- Validate that the first blocked resume command matches the current operator first command and that preflight appears before apply, with apply before strict proof.
- Update docs and QA expectations so resume packets cannot regress to broad proof/refresh commands as the first operator action.
- Preserve privacy: no release URLs, support URLs, feed URLs, channels, credentials, local env values, signing identities, notary credentials, uploads, network probes, or external distribution completion claims.

## Out of Scope

- Editing `.env.distribution.local` values.
- Supplying private release metadata, update feed values, Developer ID identities, notary credentials, or manual QA approval.
- Running real signing, notarization, Gatekeeper distribution, feed publishing, release upload, or external distribution probes.
- Changing beat-composition workflows, renderer UI, project schema, audio rendering, export artifacts, or package contents.

## Validation

- `node --check harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`
- `PYTHONDONTWRITEBYTECODE=1 python3 -m py_compile harness/scripts/run_qa.py`
- `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- `npm run release:check`
- `npm run release:external-completion-resume-packet-smoke`

## Decision Log

- 2026-07-03: Created after plan-1296 made the external completion run packet mirror the current operator sequence. The resume packet now consumes that run packet, so it should preserve and validate the same operator/proof split at the resume handoff boundary.
- 2026-07-03: Mirrored the run packet's current operator sequence into the resume packet JSON, Markdown, and console output, including first/preflight/apply/strict-proof commands plus blocker and next-actions refresh commands.
- 2026-07-03: Added validation that the next resume command matches the current operator first command and does not use the strict proof command as the next operator action while release-channel metadata is blocked.
- 2026-07-03: Updated QA text expectations and docs so resume packets preserve the value-free operator/proof split and preflight-before-apply/apply-before-strict-proof ordering.
- 2026-07-03: `npm run release:check` required an unsandboxed rerun for Electron launch smoke after the sandboxed macOS GUI context blocked launch; the unsandboxed release check completed successfully without recording private release metadata.
- 2026-07-03: Verified the target resume packet in a fresh worktree with no ignored local env present; it now reports `npm run release:prepare-env` as both the current operator first command and the next resume command, with `npm run release:private-edit-strict-proof` retained as the next resume proof command.
