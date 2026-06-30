# plan-1194-release-channel-live-check

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Continue finishing GrooveForge for working producers and first-time composers, report completion after each completed work item, and report every 10 completed plans.

## Goal

Add a narrow, value-free release-channel live check that lets the operator validate only the four current `.env.distribution.local` release-channel metadata keys immediately after private edits, before rerunning heavier release doctor/proof bundle/progress/current-blocker evidence.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, synthetic, or private values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.

## Context Map

- Plan 1193 promoted the Post-Edit Proof Sequence Receipt from next-actions through proof bundle, progress, and current-blocker reports.
- The remaining completion blocker is still four operator-owned release-channel metadata placeholders in `.env.distribution.local`.
- Existing `release:doctor` proves the blocker but also runs multiple distribution smokes; a focused live check can shorten the operator's edit/verify loop while keeping all private values redacted.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add a local `release:channel-live-check` script and package command for the four current release-channel metadata keys.
- [x] Write ignored Markdown/JSON artifacts with per-key present/placeholder/shape/current-ready posture, edit locations, proof/rerun commands, and no values.
- [x] Surface the live-check command in durable release docs and guidance where it helps the operator after private edits.
- [x] Update QA expectations and durable docs.

## QA Plan

- `node --check harness/scripts/run_release_channel_live_check.mjs`
- `node --check harness/scripts/run_release_next_actions.mjs`
- `node --check harness/scripts/run_release_progress_report.mjs`
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:channel-live-check`
- `npm run release:next-actions`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke`
- direct JSON inspection for release-channel live-check value-free rows

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add a focused value-free live check instead of another broad release gate. | The remaining blocker is specific to four private release-channel metadata values, so the operator needs a fast local acceptance signal that does not record values or claim external distribution. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main confirmed `99.999999%` completion, `1191-1200: 3/10`, and four release-channel metadata placeholders still blocking external/private release proof. |
| 2026-06-30 | harness_builder | Added `npm run release:channel-live-check`, which reads the ignored local env, writes value-free Markdown/JSON, reports 0/4 current-ready rows and four placeholder edit locations in the current placeholder state, and records no URL/channel values. |
| 2026-06-30 | doc_gardener | Updated README, release readiness, harness architecture, quality rules, and QA expectations for the live-check command without adding it to the hard verify chain. |
| 2026-06-30 | quality_runner | Passed Node syntax checks, repo QA, diff whitespace check, release-channel live check, release next-actions, release proof-bundle smoke, release progress smoke, release current-blocker smoke, and direct live-check JSON inspection. |

## Completion Summary

Added a focused value-free release-channel live check for the four current external distribution metadata keys. The command gives the operator a fast current local-env receipt after private edits, while the existing release doctor/current-blocker/proof-bundle/progress hard evidence chain remains the authoritative release path.

## QA Results

- Passed: `node --check harness/scripts/run_release_channel_live_check.mjs`
- Passed: `node --check harness/scripts/run_release_next_actions.mjs`
- Passed: `node --check harness/scripts/run_release_progress_report.mjs`
- Passed: `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run release:channel-live-check`
- Passed: `npm run release:next-actions`
- Passed: `npm run release:proof-bundle-smoke`
- Passed: `npm run release:progress-smoke`
- Passed: `npm run release:current-blocker-smoke`
- Passed: direct JSON inspection confirmed four live-check rows, four current placeholder keys, four edit locations, 0/4 current-ready rows, no URL values, `privateValuesRecorded: false`, and no external distribution claim.
