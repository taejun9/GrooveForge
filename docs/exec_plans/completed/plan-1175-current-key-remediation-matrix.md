# plan-1175-current-key-remediation-matrix

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Continue finishing GrooveForge for both first-time composers and working producers, report completion after each completed work item, and report every 10 completed plans.

## Goal

Add a value-free current release-channel key remediation matrix to the current blocker receipt so each of the four blocked release-channel keys shows its edit location, expected shape, placeholder posture, acceptance criteria it helps unblock, proof command, rerun command, hard gate, and value-recorded posture.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, or synthetic values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.

## Context Map

- `harness/scripts/run_release_current_blocker_smoke.mjs` writes the current value-free blocker receipt.
- Current placeholder edit locations identify the four blocked release-channel keys and lines.
- Current input shape checklist provides the allowed channel-token and safe HTTPS URL shape evidence.
- Current action acceptance rows show the three release-channel criteria blocked by placeholders/private-input/channel-QA evidence.
- `harness/scripts/run_qa.py` guards script/doc contract strings.
- `docs/release/readiness.md`, `docs/architecture/harness.md`, and `docs/quality/rules.md` describe release current-blocker behavior.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release blocker evidence value-free.

## Implementation Plan

- [x] Add current release-channel key remediation matrix rows to the current-blocker report.
- [x] Render matrix rows in JSON, Markdown, and console output.
- [x] Validate row count, key coverage, location/shape linkage, acceptance criterion linkage, proof/rerun/hard-gate commands, and value-free posture.
- [x] Update QA expectations and durable release/harness docs.

## QA Plan

- Passed: `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run release:progress-smoke`
- Passed: `npm run release:current-blocker-smoke`
- Passed: direct JSON inspection confirmed `currentReleaseChannelKeyRemediationReady: true`, `currentReleaseChannelKeyRemediationRowCount: 4`, all matrix rows `valueRecorded: false`, completion `99.999999`, and current 10-plan progress `1171-1180: 4/10` before completing this plan.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add a per-key remediation matrix instead of editing private env values. | The remaining blocker is operator-owned release-channel metadata; the repo can reduce mistakes by tying each blocked key to location, shape, acceptance impact, and commands without values. |
| 2026-06-30 | Keep the matrix inside the current-blocker receipt. | Operators already use `npm run release:current-blocker` after ignored env edits, so the key-level table belongs beside the acceptance remediation and input shape evidence. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after current-blocker smoke confirmed 99.999999% overall completion, current 10-plan progress `1171-1180: 4/10`, and four placeholder release-channel keys. |
| 2026-06-30 | harness_builder | Added current release-channel key remediation matrix rows, JSON fields, Markdown section, console output, QA expectations, and release/harness/quality docs. |
| 2026-06-30 | quality_runner | `node --check`, `python3 harness/scripts/run_qa.py`, and `git diff --check` passed after aligning the quality-rule contract string. |
| 2026-06-30 | quality_runner | `npm run release:progress-smoke` passed with completion `99.999999%` and current 10-plan progress `1171-1180: 4/10`. |
| 2026-06-30 | quality_runner | `npm run release:current-blocker-smoke` passed, reporting four value-free release-channel key remediation rows. |

## Completion Notes

The current blocker receipt now derives four value-free current release-channel key remediation matrix rows from the current required keys. Each row names the key, `.env.distribution.local` edit location, placeholder posture, expected shape, acceptance criteria impacted, proof command, rerun command, hard gate command, and `valueRecorded: false` posture without storing private URL/channel values.

Overall completion remains `99.999999%`; the remaining `0.000001%` is still the external/private distribution proof blocked by placeholder release-channel metadata in `.env.distribution.local:10-13`.
