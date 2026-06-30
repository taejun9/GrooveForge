# plan-1201-release-channel-strict-check

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge for working producers and first-time composers, report completion after each completed work item, and report progress every 10 plans.

## Goal

Add a strict, value-free release-channel live check that exits non-zero until the four current private release-channel metadata keys are present, non-placeholder, and shape-ready. This gives the operator a clear pass/fail command after editing the ignored local env file without recording channel or URL values and without claiming external distribution.

## Non-Goals

- Replacing private `.env.distribution.local` values.
- Recording release URL, support URL, feed URL, channel, credential, token, identity, synthetic, or private values.
- Uploading releases, publishing update feeds, probing remote channels, signing artifacts, submitting to Apple, approving manual QA, or claiming external distribution completion.
- Changing app UI, audio, project schema, packaging behavior, or sampling scope.
- Adding the strict command to `npm run verify` while placeholders are still the expected local state.

## Context Map

- Plan 1194 added `npm run release:channel-live-check`, which truthfully writes value-free readiness evidence while passing even when private placeholders remain.
- Plan 1200 added `npm run release:final-handoff`, which points the operator at the remaining private metadata handoff.
- The next useful release step is a strict pass/fail command for the same value-free live check, so the final private edit can be verified without reading values into durable artifacts.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep all release evidence value-free.

## Implementation Plan

- [x] Add strict-mode support to `harness/scripts/run_release_channel_live_check.mjs`.
- [x] Add `npm run release:channel-live-check-strict` to `package.json`.
- [x] Update README, release readiness docs, harness docs, and quality rules.
- [x] Update QA expectations so the new command is discoverable while not required to pass with placeholder local values.
- [x] Add a value-free strict-mode failure proof for the current placeholder state.

## QA Plan

- `node --check harness/scripts/run_release_channel_live_check.mjs`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run release:channel-live-check`
- `npm run release:channel-live-check-strict` should fail value-free while placeholders remain
- Direct JSON inspection for strict-mode fields and value redaction

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add strict mode to the existing live check instead of creating a separate parser. | The existing command already owns value-free parsing and shape validation for the four current release-channel metadata keys. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Plan created after main showed overall completion `99.999999%`, current 10-plan progress `1191-1200: 10/10`, and four release-channel metadata placeholders still blocking external distribution. |
| 2026-06-30 | harness_builder | Added `--strict` support to `run_release_channel_live_check.mjs`, the `npm run release:channel-live-check-strict` script, strict value-free Markdown/JSON fields, docs, and QA expectations. |
| 2026-06-30 | quality_runner | `node --check harness/scripts/run_release_channel_live_check.mjs`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run release:channel-live-check`, `npm run release:prepare-env`, intentional failing `npm run release:channel-live-check-strict`, and direct strict JSON inspection passed. The strict receipt exits non-zero with four value-free failure rows while release-channel placeholders remain. |
