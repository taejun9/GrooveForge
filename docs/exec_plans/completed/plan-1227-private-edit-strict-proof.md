# plan-1227-private-edit-strict-proof

## Status

completed

## Owner

project_lead / 박자

## User Request

Continue completing GrooveForge so both working producers and first-time beat makers can use it, report completion after each work unit, and keep 10-plan progress visibility.

## Goal

Add an operator-facing private edit strict proof chain that runs the strict release-channel proof first after private local env edits, then refreshes post-edit proof and progress evidence when strict proof passes.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not record release URL, support URL, feed URL, channel, credential, token, Developer ID identity, private beat, or user audio values.
- Do not probe update feeds, upload releases, sign artifacts, submit to Apple notarization, or claim auto-update/external distribution completion.
- Do not put the strict real-env proof command in `npm run verify` while placeholders are expected.
- Do not change the product center away from all-genre direct beat composition.

## Context Map

- `harness/scripts/run_release_channel_live_check.mjs`
- `harness/scripts/run_release_channel_live_check_strict_success_smoke.mjs`
- `harness/scripts/run_release_post_edit_proof.mjs`
- `harness/scripts/run_release_progress_refresh_smoke.mjs`
- `harness/scripts/run_release_private_edit_quick_proof_smoke.mjs`
- `harness/scripts/run_qa.py`
- `package.json`
- `README.md`
- `docs/release/readiness.md`
- `docs/architecture/harness.md`
- `docs/quality/rules.md`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1227-private-edit-strict-proof` and `.worktree/plan-1227-private-edit-strict-proof` for git repository work.

## Implementation Plan

- [x] Inspect strict live-check, post-edit proof, progress refresh, and quick-proof artifact shapes.
- [x] Add a strict private edit proof chain with a real operator command and a synthetic success smoke command.
- [x] Update package scripts, static QA expectations, and durable docs.
- [x] Run focused checks, QA, and release refresh validation.

## QA Plan

- `node --check harness/scripts/run_release_private_edit_strict_proof.mjs`
- `npm run release:private-edit-strict-proof-success-smoke`
- `python3 harness/scripts/run_qa.py`
- `npm run release:progress-refresh-smoke`
- `npm run release:private-edit-quick-proof-smoke`
- `npm run release:private-edit-strict-proof`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-01 | Started plan-1227 to add a strict proof chain after private release-channel edits. | The current blocker is four release-channel placeholders, and the operator needs a single value-free command that proves strict readiness before refreshing post-edit/progress evidence. |
| 2026-07-01 | Kept the real strict proof command out of `npm run verify` and added a synthetic success smoke instead. | Real env placeholders should block the operator command until private values are edited, while verify must remain deterministic and value-free. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-01 | project_lead | Plan created from current release current-blocker and quick-proof evidence. |
| 2026-07-01 | harness_builder | Added `run_release_private_edit_strict_proof.mjs`, package scripts, docs, and QA expectations. |
| 2026-07-01 | quality_runner | Ran focused script checks, QA, the expected blocking real command, and full `npm run verify`. |

## Completion Notes

Completed. Added `npm run release:private-edit-strict-proof` as the operator command after private release-channel edits and `npm run release:private-edit-strict-proof-success-smoke` for deterministic verify coverage. The real command runs strict release-channel proof first, blocks before post-edit/progress refresh when strict proof fails, and writes a value-free blocked receipt. The success smoke proves the pass path without reading real private env values.
