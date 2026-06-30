# plan-1177-command-source-artifact-matrix

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Continue finishing GrooveForge for both first-time composers and working producers, report completion after each completed work item, and report every 10 completed plans.

## Goal

Add a value-free current command source artifact matrix to the release current-blocker receipt so each source artifact consumed by the current command acceptance ladder shows the consuming commands, acceptance signals, artifact presence posture, proof command, rerun command, hard gate, and value-recorded posture.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, or synthetic values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.

## Context Map

- `harness/scripts/run_release_current_blocker_smoke.mjs` writes the current value-free blocker receipt.
- Current command acceptance ladder rows already name commands, acceptance signals, evidence labels, and source artifact paths.
- Current command verification rows provide structured evidence path and label arrays.
- `harness/scripts/run_qa.py` guards script/doc contract strings.
- `docs/release/readiness.md`, `docs/architecture/harness.md`, and `docs/quality/rules.md` describe release current-blocker behavior.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release blocker evidence value-free.

## Implementation Plan

- [x] Add current command source artifact matrix rows to the current-blocker report.
- [x] Render matrix rows in JSON, Markdown, and console output.
- [x] Validate row count, artifact coverage, consuming command linkage, acceptance signal linkage, proof/rerun/hard-gate commands, and value-free posture.
- [x] Update QA expectations and durable release/harness docs.

## QA Plan

- Passed: `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run release:progress-smoke`
- Passed: `npm run release:current-blocker-smoke`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add source artifact matrix rows instead of editing private env values. | The remaining blocker is operator-owned release-channel metadata; the repo can still make post-edit reruns more reliable by proving which value-free artifacts each command consumes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after current-blocker smoke confirmed 99.999999% overall completion, current 10-plan progress `1171-1180: 6/10`, and five command acceptance ladder rows. |
| 2026-06-30 | harness_builder | Added current command source artifact matrix report fields, Markdown section, console output, and validation checks without recording private values. |
| 2026-06-30 | quality_runner | Verified the matrix is ready with two present source artifact rows, each consumed by five current commands and marked `valueRecorded: false`. |

## Completion Notes

Current-blocker receipts now include a value-free current command source artifact matrix. The matrix links the distribution private-inputs artifact and distribution-channel QA artifact to their consuming current commands, evidence labels, acceptance signals, proof/rerun/hard-gate commands, present posture, and value-free posture. Overall project completion remains `99.999999%`; the remaining `0.000001%` is still the external/private release proof blocked by `.env.distribution.local:10-13` placeholder values for release-channel metadata.
