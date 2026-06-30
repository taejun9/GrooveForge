# plan-1197-post-edit-proof-command

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge for working producers and first-time composers, and report completion after each completed work item.

## Goal

Add a value-free `npm run release:post-edit-proof` command that operators can run after editing ignored `.env.distribution.local` release-channel metadata. The command should run the narrow live check first, then refresh the current-blocker evidence, and write a compact post-edit proof receipt without recording private URL/channel values or claiming external distribution completion.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, synthetic, or private values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.
- Adding the command to the full `npm run verify` gate.

## Context Map

- Plan 1194 added `npm run release:channel-live-check`.
- Plan 1195 mirrored live-check receipt evidence into release progress and current-blocker reports.
- Plan 1196 surfaced `npm run release:channel-live-check` as the first proof after private edits.
- A single operator-facing command should now run that first proof and refresh the current blocker receipt in order.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add `harness/scripts/run_release_post_edit_proof.mjs`.
- [x] Add `npm run release:post-edit-proof` to `package.json`.
- [x] Write value-free Markdown/JSON receipt artifacts under ignored `build/desktop/`.
- [x] Validate command order, mirrored live-check/current-blocker posture, and value redaction.
- [x] Update QA expectations and durable docs.

## QA Plan

- `node --check harness/scripts/run_release_post_edit_proof.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:post-edit-proof`
- Direct JSON inspection for command order, current blocker, first proof, and value redaction

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add a post-edit proof command outside `npm run verify`. | This command is for operator-owned private-env edits and should refresh local evidence on demand without becoming a hard CI-style gate while placeholders may remain. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main showed overall completion `99.999999%`, 10-plan progress `1191-1200: 6/10`, live-check readiness false, and four release-channel placeholders still blocking external distribution. |
| 2026-06-30 | harness_builder | Added `npm run release:post-edit-proof`, the value-free receipt writer, README/release/quality/harness docs, and QA expectations. |
| 2026-06-30 | quality_runner | `node --check harness/scripts/run_release_post_edit_proof.mjs`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run release:post-edit-proof`, and direct JSON inspection passed. The receipt remained value-free with post-edit ready false while four release-channel placeholders remain. |
