# plan-1406-placeholder-resume-command

## Goal

Make the current placeholder-private-input blocker expose a direct value-free resume command and edit target from the private input ready gate, so an operator can replace `.env.release-channel.local` placeholder rows and rerun the right proof path without treating `npm run release:doctor` as the only next action.

## Scope

- Surface a ready-gate resume command and placeholder edit target in current-blocker and completion-summary evidence.
- Keep the primary preflight/apply/strict-proof order intact.
- Update docs and QA expectations for the new value-free resume contract.
- Validate with QA, build, completion refresh, and actual app screen launch smoke.

## Out of Scope

- Filling private release-channel values.
- Reading or recording release URLs, support URLs, feed URLs, credentials, tokens, channel values, or identity labels.
- Probing release channels, uploading releases, signing, notarizing, or claiming external distribution completion.
- Changing product UI, project data, beat generation, audio behavior, or sampling scope.

## Decision Log

- Start from the existing private input ready gate because it already distinguishes missing, placeholder, invalid, and ready rows without reading values.
- Preserve `npm run release:channel-apply-private-env-preflight` as the operator sequence first command; the new resume command is a checkpoint that points placeholder edits back to the ready gate before apply.

## Completion Criteria

- Current-blocker evidence reports a value-free ready-gate resume command and blocked private input edit target when placeholder rows remain.
- Completion summary refresh mirrors the same resume command/target for after-work reporting.
- QA verifies the new fields, docs, and package command map.
- The plan is moved to `docs/exec_plans/completed/` with a review mirror under `docs/reviews/`.

## Validation Log

- `python3 harness/scripts/run_qa.py` passed.
- `node --check` passed for `run_release_channel_private_input_ready_gate.mjs`, `run_release_current_blocker_smoke.mjs`, `run_release_completion_summary_smoke.mjs`, and `run_release_completion_summary_refresh_smoke.mjs`.
- `npm run release:channel-placeholder-input-receipt-smoke` passed.
- `npm run release:channel-private-input-ready-gate-smoke` passed with `readyGateResumeCommand` set to `npm run release:channel-private-input-ready-gate` and blocked `.env.release-channel.local` edit rows.
- `npm run release:channel-private-input-ready-gate-ready-smoke` passed with `readyGateResumeCommand` set to `npm run release:channel-apply-private-env` and `readyGateResumeEditTarget` set to `none; private input rows are shape-ready`.
- `npm run release:source-evidence-refresh-smoke` passed with approved GUI/AppKit access after the sandbox correctly blocked Electron project IO; source artifacts were 21/21 present.
- `npm run release:progress-smoke` passed after generating the missing value-free release-channel unblock rehearsal artifact.
- `npm run release:current-blocker-smoke` passed and exposed `Private input ready gate resume command` plus the ignored private input edit target in the current blocker report.
- `npm run release:completion-summary-refresh-smoke` passed and mirrored `privateInputReadyGateResumeCommand`/`privateInputReadyGateResumeEditTarget` in the after-work completion receipt.
- After moving the plan to completed, `npm run release:completion-summary-refresh-smoke` passed again with latest completed plan `plan-1406`, 10-plan progress `1401-1410: 6/10`, user-facing completion `99.999999%`, remaining completion `0.000001%`, and current first blocker `Ignored local distribution env file is not loaded.`
- `npm run qa` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run desktop:launch-smoke` passed with approved GUI/AppKit access; it rendered the production Electron app, checked 37 required test ids, sampled 75 colors, and verified beginner/professional producer Quick Actions paths.
- `git diff --check` passed.

## Completion Notes

- Added value-free ready-gate resume fields to the private input ready gate report.
- Mirrored those fields through current-blocker, completion-summary, and completion-summary-refresh evidence.
- Updated README, release readiness, harness architecture, quality rules, and static QA expectations for the new resume contract.
- No private release-channel values were read, written, recorded, uploaded, signed, notarized, or claimed as externally distributed.
