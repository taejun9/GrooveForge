# plan-1288-external-run-sequence-status

## Goal

Make the external completion run packet distinguish the current actionable blocker from downstream steps that are only waiting on earlier proof, so the final distribution path is easier to execute without exposing private values.

## Scope

- Add value-free sequence status to `release:external-completion-run-packet-smoke` run rows.
- Report current blocker rows and waiting rows separately in JSON, Markdown, and console output.
- Keep the existing ordered run rows, readiness posture, privacy boundary, and no-claim release posture.
- Update QA rules so the packet contract covers sequence status.

## Out Of Scope

- Supplying private release URLs, feed URLs, channel values, Developer ID identity labels, or Apple credentials.
- Signing, notarizing, publishing feeds, probing distribution channels, uploading releases, approving manual QA, or claiming external distribution completion.
- Changing the product workstation, musical generation, or desktop packaging behavior.

## Changes

- Added `sequenceStatus` to external completion run packet rows:
  - `ready` for completed prerequisites.
  - `current-blocker` for the first incomplete run row.
  - `waiting-for-prerequisite` for later incomplete rows.
- Added JSON, Markdown, console, and self-check fields for current blocker row count/summary and waiting row count/summary.
- Updated `docs/quality/rules.md` so future packet work preserves the sequence-status contract.

## Validation

- `node --check harness/scripts/run_release_external_completion_run_packet_smoke.mjs` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run release:check` passed with approved unsandboxed GUI/AppKit access after the sandboxed run stopped at the expected restricted Electron launch guard.
- `npm run release:external-completion-run-packet-smoke` passed.
- Direct JSON inspection passed:
  - `externalCompletionRunPacketReady=true`
  - `currentBlockedRunRowCount=1`
  - `currentBlockedRunRowSummary=release-channel-metadata`
  - `waitingRunRowCount=11`
  - `runRows[0].sequenceStatus=current-blocker`
  - `runRowsValueFree=true`
  - `privateValuesRecorded=false`
  - `claimedExternalDistribution=false`
- `git diff --check` passed.

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-02 | project_lead | Keep the current blocker as release-channel metadata and improve the external run packet instead of adding another redundant proof packet. |
| 2026-07-02 | harness_builder | Add sequence status as a value-free run-row field while preserving existing readiness semantics for downstream checks. |
| 2026-07-02 | quality_runner | Ran the full release gate with unsandboxed GUI/AppKit access because the sandbox correctly blocked Electron AppKit launch; the full gate passed afterward. |

## Completion

Completed. The external completion run packet now distinguishes the active release-channel blocker from downstream waiting steps. In the current worktree, the packet reports one current blocker row (`release-channel-metadata`) and eleven waiting rows, while preserving value-free output and no external distribution claim.
