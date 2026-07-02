# plan-1296-external-run-packet-operator-sequence

## Goal

Make the external completion run packet expose the same value-free current operator command sequence as current-blocker/progress evidence, so its first actionable release-channel metadata command points to `npm run release:channel-apply-private-env-preflight` before `npm run release:channel-apply-private-env` instead of jumping straight to the strict proof command.

## Scope

- Mirror current operator command sequence fields from completion summary/progress evidence into `npm run release:external-completion-run-packet-smoke`.
- Keep the run packet's broader ordered external completion rows intact, but make the current blocker row distinguish operator commands from proof/refresh commands.
- Update docs and QA expectations so the external completion run packet cannot regress to a proof command as the first actionable operator command.
- Preserve privacy: no release URLs, support URLs, feed URLs, channels, credentials, local env values, signing identities, notary credentials, uploads, network probes, or external distribution completion claims.

## Out of Scope

- Editing `.env.distribution.local` values.
- Supplying private release metadata, update feed values, Developer ID identities, notary credentials, or manual QA approval.
- Running real signing, notarization, Gatekeeper distribution, feed publishing, release upload, or external distribution probes.
- Changing beat-composition workflows, renderer UI, project schema, audio rendering, export artifacts, or package contents.

## Validation

- `node --check harness/scripts/run_release_external_completion_run_packet_smoke.mjs`
- `PYTHONDONTWRITEBYTECODE=1 python3 -m py_compile harness/scripts/run_qa.py`
- `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- `npm run release:check`
- `npm run release:external-completion-run-packet-smoke`
- `npm run release:external-completion-resume-packet-smoke`

## Decision Log

- 2026-07-03: Created after `npm run release:external-completion-run-packet-smoke` passed but printed `First run command: npm run release:private-edit-strict-proof` while current-blocker/progress evidence showed the true current operator first command is `npm run release:channel-apply-private-env-preflight`. The packet needs the same operator/proof split as plan-1295 so the final private metadata step is less ambiguous.
- 2026-07-03: Updated the external completion run packet to mirror `currentOperatorCommandRows`, expose the current operator first/preflight/apply/strict-proof commands, and require preflight-before-apply plus apply-before-strict-proof ordering.
- 2026-07-03: Changed the first release-channel run row to follow the current operator first command instead of the strict proof command, while preserving the strict proof command as the row's proof command.
- 2026-07-03: Added QA expectations and docs so future packet changes must keep the mirrored Current Operator Command Sequence, avoid private value recording, and reject strict proof as the first operator command while release-channel metadata is still blocked.
- 2026-07-03: Verified the worktree with no ignored local env present; the run and resume packets now report `npm run release:prepare-env` as the first run/resume command and keep the next proof command at `npm run release:private-edit-strict-proof`.
- 2026-07-03: `npm run release:check` required an unsandboxed rerun for Electron launch smoke after the sandboxed macOS GUI context blocked launch; the unsandboxed release check completed successfully without recording private release metadata.
