# plan-1390-completion-refresh-command-count Review

## Verdict

Pass with post-merge main verification required. The completion summary refresh command-row validation now derives its expected count and always-run command slice from `requiredRefreshCommands.length`, so future required command additions do not leave stale hard-coded counts behind.

## Scope Reviewed

- Replaced the hard-coded `6` command-row count with `requiredRefreshCommands.length + 1`.
- Replaced the hard-coded first-five always-run slice with `slice(0, requiredRefreshCommands.length)`.
- Added static QA expectations for the dynamic command-count expressions and updated required-command wording.

## QA Reviewed

- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs` passed.
- `npm run qa` passed.
- `git diff --check` passed.
- `npm run build` passed.
- `npm run desktop:launch-smoke` passed against the live production Electron app screen, including beginner, producer, Quick Actions, Command Reference, and workstation route evidence.
- `npm run release:source-evidence-prereq-smoke` passed in the isolated plan worktree with 0/21 source artifacts and value-free source-missing fallback output.

## Residual Risk

The isolated plan worktree does not contain the main worktree's ignored release source evidence, so full `npm run release:completion-summary-refresh-smoke` validation must be rerun on `main` after merge.

## Follow-Up

After merge, rerun `npm run release:source-evidence-prereq-smoke`, `npm run release:completion-summary-refresh-smoke`, and `npm run desktop:launch-smoke` on `main`.
