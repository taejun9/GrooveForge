# plan-1492-launch-timeout-contract

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Restore the renderer smoke after plan 1491 by aligning its launch-bearing parent timeout contract and documentation with the production launch collector's actual 30-minute budget.

## Evidence and Motivation

Main post-merge QA found that `npm run renderer:smoke` still required the four launch-bearing parent harnesses to contain the obsolete 660-second timeout and 640-second comment. Plan 1491 correctly raised those parents to 1,820 seconds because the production app collector is 1,800 seconds, but did not update this separate renderer-source contract.

## Non-Goals

- Changing launch assertions, application behavior, project data, audio rendering, or user workflows.
- Raising any timeout beyond the existing 30-minute-plus-20-second parent budget.
- Adding network, signing, notarization, or external-distribution claims.

## Constraints

- QA completes before separate review.
- All four launch-bearing parent runners, the renderer source contract, static QA, and quality documentation must agree on 1,800/1,820 seconds.
- The existing sample-audio hashes and unrelated plan-085 worktree remain untouched.

## Implementation Plan

- [x] Update the stale renderer contract, parent comments, and quality documentation.
- [x] Run renderer, static, type, focused launch-contract, and sample-audio QA.
- [x] Run a separate post-QA review and complete the plan/review mirror before merge, push, evidence refresh, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-17 | Treat the post-merge renderer failure as a new focused plan. | Plan 1491 was already completed and merged; AGENTS requires every follow-up implementation task to have an active exec plan. |
| 2026-07-17 | Preserve the 1,820-second parent limit and update the stale verifier. | Actual production launch collection is bounded at 1,800 seconds, so reverting parents to 660 seconds would recreate the healthy-child termination failure. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-17 | project_lead | Created plan-1492 from main `69452225` after the post-merge renderer smoke exposed the stale 640/660-second source contract; plan-085 remains untouched. |
| 2026-07-17 | harness_builder | Updated all four launch-bearing parent comments, the renderer source assertion, and the two durable quality rules to the production 1,800-second collector and 1,820-second parent budget. No runtime timeout or application behavior changed. |
| 2026-07-17 | quality_runner | Renderer smoke, static QA, quality gate, typecheck, and `git diff --check` passed. Sample-audio QA decoded 41/41 playable WAVs with 41/41 digital-zero endings, 33/33 full-mix tails, and 11/11 isolation checks; both reference hashes remained unchanged. |
| 2026-07-17 | review_judge | Separate post-QA review found no blocking, major, or moderate issue. The diff is limited to correcting the stale verification/documentation contract to match the already exercised production timeout values. |
