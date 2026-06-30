# plan-1229-channel-edit-strict-proof

## Status

completed

## Owner

project_lead / 박자

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can use it, report completion after each work unit, and keep 10-plan progress visibility.

## Goal

Make the release-channel edit packet itself recommend `npm run release:private-edit-strict-proof` as the operator command after replacing the four private release-channel placeholders, while keeping the narrower live-check, strict live-check, current-blocker, next-actions, and hard-gate roles explicit and value-free.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not record release URL, support URL, feed URL, channel, credential, token, Developer ID identity, private beat, or user audio values.
- Do not probe update feeds, upload releases, sign artifacts, submit to Apple notarization, or claim auto-update/external distribution completion.
- Do not remove low-level proof commands; the edit packet should clarify roles, not hide source checks.
- Do not change the product center away from all-genre direct beat composition.

## Context Map

- `harness/scripts/run_release_channel_edit_packet_smoke.mjs`
- `harness/scripts/run_release_completion_report_packet_smoke.mjs`
- `harness/scripts/run_qa.py`
- `README.md`
- `docs/release/readiness.md`
- `docs/architecture/harness.md`
- `docs/quality/rules.md`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1229-channel-edit-strict-proof` and `.worktree/plan-1229-channel-edit-strict-proof` for repository work.

## Implementation Plan

- [x] Add value-free edit-packet fields/rows for the recommended private-edit strict proof chain.
- [x] Keep lower-level live-check, strict live-check, current-blocker, next-actions, and hard-gate command roles explicit.
- [x] Mirror the edit-packet recommendation into completion packet evidence where it reads the channel edit packet.
- [x] Update docs and static QA expectations.
- [x] Run focused checks and release packet/progress smokes.

## QA Plan

- [x] `node --check harness/scripts/run_release_channel_edit_packet_smoke.mjs`
- [x] `node --check harness/scripts/run_release_completion_report_packet_smoke.mjs`
- [x] `npm run verify`
- [x] `npm run release:progress-refresh-smoke`
- [x] `npm run release:channel-edit-packet-smoke`
- [x] `npm run release:completion-report-packet-smoke`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `git diff --check`

## Review Plan

QA completed before review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Started plan-1229 to make the edit packet recommend the strict proof chain directly. | The current blocker is still four release-channel placeholders, and the edit packet is the most direct artifact an operator sees before replacing those values. |
| 2026-07-01 | Kept the lower-level live-check and strict live-check commands in the packet beside the recommended operator proof chain. | Operators need the one command to run after private edits while reviewers still need the underlying proof roles visible. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Current blocker remains four release-channel placeholders in `.env.distribution.local`; 10-plan progress is `1221-1230: 8/10`. |
| 2026-07-01 | harness_builder | Added value-free release-channel edit packet fields for `npm run release:private-edit-strict-proof`, plus explicit lower-level live-check and strict live-check fields. |
| 2026-07-01 | harness_builder | Mirrored the edit packet recommended proof chain and operator order into the release completion report packet. |
| 2026-07-01 | quality_runner | Full verify, focused release smokes, static QA, and diff check passed before review. |
| 2026-07-01 | review_judge | Reviewed the completed change and found no follow-up issues. |

## Completion Notes

The release-channel edit packet now names `npm run release:private-edit-strict-proof` as the recommended operator proof chain after replacing private release-channel values, while still exposing `npm run release:channel-live-check` and `npm run release:channel-live-check-strict` as lower-level proof commands.

The release completion report packet now mirrors that recommendation, including the channel edit packet operator order from prepare-env through manual edit, strict proof chain, lower-level checks, blocker refresh, next-actions, and hard gate.

Docs and static QA expectations were updated across the README, release readiness, harness architecture, quality rules, and QA script. No private values were read, written, recorded, or claimed.
