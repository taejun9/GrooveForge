# plan-1172-current-blocker-input-shape-checklist

## Status

active

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Continue finishing GrooveForge for both first-time composers and working producers, report completion after each completed work item, and report every 10 completed plans.

## Goal

Make the current release blocker receipt show value-free expected input shapes for the four release-channel metadata keys, so the operator can replace placeholders in the ignored local env file with less risk before rerunning release proof commands.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, or synthetic values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.

## Context Map

- `harness/scripts/run_release_current_blocker_smoke.mjs` writes the current value-free blocker receipt.
- `harness/scripts/run_release_channel_unblock_smoke.mjs` already proves the four release-channel keys can clear the placeholder blocker with shape-valid values.
- `harness/scripts/run_qa.py` guards script/doc contract strings.
- `docs/release/readiness.md`, `docs/architecture/harness.md`, and `docs/quality/rules.md` describe release current-blocker behavior.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release blocker evidence value-free.

## Implementation Plan

- [x] Add value-free current input shape checklist rows to the current-blocker report.
- [x] Render the shape rows in JSON, Markdown, and console output.
- [x] Validate row count, key coverage, expected shape descriptions, command references, and value-free posture.
- [x] Update QA expectations and durable release/harness docs.

## QA Plan

- Passed: `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run release:progress-smoke`
- Passed: `npm run release:current-blocker-smoke`
- Passed: direct JSON inspection confirmed `currentInputShapeChecklistReady: true`, 4 rows, the four release-channel metadata keys, allowed channel-token guidance for `GROOVEFORGE_DISTRIBUTION_CHANNEL`, safe HTTPS URL-shape guidance for the three URL keys, and `valueRecorded: false` for every row.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add value-free input shape rows to current-blocker instead of editing private env values. | The remaining blocker is operator-owned private release metadata; the repo can still reduce failed reruns by making expected shapes explicit without storing values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after release progress confirmed 99.999999% overall completion and current 10-plan progress `1171-1180: 1/10`. |
| 2026-06-30 | harness_builder | Added `currentInputShapeChecklistRows` to the current-blocker report JSON, Markdown, console output, and validation. |
| 2026-06-30 | quality_runner | Ran script syntax check, base QA, diff whitespace check, release progress smoke, current blocker smoke, and direct JSON inspection. |

## Completion Notes

Completed. The current-blocker receipt now includes a value-free current input shape checklist for the four release-channel metadata keys. It mirrors the release-channel unblock evidence, points at the current proof and rerun commands, records no values, and keeps external distribution unclaimed.
