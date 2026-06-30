# plan-1196-live-check-first-proof

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge for working producers and first-time composers, and report completion after each completed work item.

## Goal

Make the operator-owned release-channel metadata blocker easier to clear by surfacing `npm run release:channel-live-check` as the value-free first proof command after ignored `.env.distribution.local` edits in release progress and current-blocker evidence, while keeping `npm run release:doctor`, `npm run release:current-blocker`, `npm run release:next-actions`, `npm run release:proof-bundle`, `npm run release:progress-smoke`, and `npm run release:external-check` as the broader proof sequence.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, synthetic, or private values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.

## Context Map

- Plan 1194 added a value-free live check for the four current release-channel metadata keys.
- Plan 1195 mirrored the live-check receipt into release progress and current-blocker reports.
- The current progress/current-blocker reports still show the broad proof command as `npm run release:doctor`; after private env edits, operators should be able to run the narrow live check first to confirm the four current keys before broader proof refreshes.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add a value-free first-after-edit live-check command field/summary to release progress.
- [x] Mirror the same first-after-edit live-check command into release current-blocker.
- [x] Add Markdown, console, and validation checks for the first-proof command without changing the broader proof sequence.
- [x] Update QA expectations and durable docs.

## QA Plan

- `node --check harness/scripts/run_release_progress_report.mjs`
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke`
- Direct JSON inspection for first-after-edit command mirroring and value redaction

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Surface live-check as the first proof after private edits without replacing `release:doctor`. | The narrow live check verifies the current four release-channel keys quickly, while the doctor/current-blocker/proof-bundle/progress/hard-gate sequence remains the broader release proof path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main showed overall completion `99.999999%`, 10-plan progress `1191-1200: 5/10`, and four release-channel placeholders still blocking external distribution. |
| 2026-06-30 | harness_builder | Added `releaseChannelFirstProofCommandAfterPrivateEdits` to release progress and current-blocker reports, with value-free Markdown/console summaries that point to `npm run release:channel-live-check`. |
| 2026-06-30 | harness_builder | Kept the broader proof sequence unchanged: `npm run release:doctor`, `npm run release:current-blocker`, `npm run release:next-actions`, `npm run release:proof-bundle`, `npm run release:progress-smoke`, and `npm run release:external-check`. |
| 2026-06-30 | quality_runner | QA passed: node syntax checks, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run release:progress-smoke`, `npm run release:current-blocker-smoke`, and direct JSON inspection for first-proof mirroring/value redaction. |
| 2026-06-30 | review_judge | Review found no blocking issues; the first-proof command now gives operators a narrow post-edit check without recording private values or claiming external distribution completion. |
