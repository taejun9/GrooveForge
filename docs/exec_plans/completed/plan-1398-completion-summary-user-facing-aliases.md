# plan-1398-completion-summary-user-facing-aliases

## Objective

Add explicit machine-readable completion summary aliases for the after-work report fields the user asks for every completed work.

## Scope

- Keep the change limited to release completion summary refresh evidence and its QA/docs coverage.
- Add top-level JSON/Markdown aliases for latest completed plan, user-facing completion, remaining completion, current next command, and current blocker without changing the underlying completion calculation.
- Preserve value-free reporting and the current external-distribution non-claiming posture.
- Prove the app still launches through the actual Electron screen test.

## Changes

- Added `latestCompletedPlan`, `latestCompletedPlanNumber`, `userFacingCompletion`, `remainingCompletion`, `currentFirstBlockerAlias`, and `currentNextCommandAlias` to the completion summary refresh receipt.
- Extended the User-Facing Completion Aliases table and console output so after-work reports can read the same field names from JSON, Markdown, or terminal output.
- Added self-checks that fail if the new aliases drift from the existing source fields.
- Updated QA expectations plus harness/release docs so future automation reads the stable aliases first.

## Validation

- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs` passed.
- `npm run qa` passed before review.
- `git diff --check` passed before review.
- `npm run build` passed.
- `npm run desktop:launch-smoke` passed against the live Electron app screen with first-time composer and professional producer paths verified.
- `npm run release:source-evidence-refresh-smoke` passed with 44 commands, 7 cleanup rows, 1 restore row, and 21/21 source artifacts present.
- `npm run release:completion-summary-refresh-smoke` passed and wrote the new alias fields to the ignored receipt JSON.

## Decision Log

- Started after the latest completion summary refresh printed the right user-facing values but required consumers to know internal field names such as `latestPlan`, `completionPercent`, `remainingPercent`, and `currentNextCommand`.
- Chose alias-only additions so existing scripts and reports keep their current source fields while newer completion reporting can use direct names.
- Verified in a clean worktree by regenerating source evidence first, because completion summary refresh correctly fails when required source artifacts are absent.
