# plan-1387-completion-current-aliases Review

## Verdict

Pass with post-merge main verification required. The completion summary refresh now exposes `currentFirstBlocker` and `currentNextCommand` as stable top-level aliases while preserving the existing `firstBlocker` and `nextCommand` fields.

## Scope Reviewed

- Mirrored the compact completion summary's `firstBlocker` and `nextCommand` into `currentFirstBlocker` and `currentNextCommand`.
- Added self-checks that the aliases match the existing fields and remain populated.
- Aligned external completion resume packet comparisons against the new current-field aliases.
- Added Markdown and console output for the aliases.
- Updated QA text expectations plus README, release readiness, harness architecture, and quality rules.

## QA Reviewed

- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs` passed.
- `npm run qa` passed.
- `git diff --check` passed.
- `npm run build` passed.
- `npm run desktop:launch-smoke` passed against the live production Electron app screen, including beginner, producer, Quick Actions, Command Reference, and workstation route evidence.
- `npm run release:source-evidence-prereq-smoke` passed in the isolated plan worktree.

## Residual Risk

The isolated plan worktree does not contain the main worktree's ignored release source evidence, so `npm run release:completion-summary-refresh-smoke` fails there at the existing source-evidence prerequisite before the modified alias checks are exercised. This must be rerun on `main` after merge.

## Follow-Up

After merge, rerun `npm run release:completion-summary-refresh-smoke` and `npm run release:source-evidence-prereq-smoke` on `main` to prove plan-1387 is reflected in the current completion summary and that the new aliases are present in the final after-work evidence.
