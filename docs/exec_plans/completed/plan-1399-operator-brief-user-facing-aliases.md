# plan-1399-operator-brief-user-facing-aliases

## Objective

Mirror the latest after-work completion summary aliases into the operator completion brief so the final external-release handoff reads the same user-facing fields as the completion report.

## Scope

- Keep the change limited to operator completion brief evidence plus QA/docs coverage.
- Add direct value-free aliases for latest completed plan, user-facing completion, remaining completion, current blocker, current next command, and operator start command.
- Preserve the existing release-channel private value redaction and external-distribution non-claiming posture.
- Prove the app still launches through the actual Electron screen test.

## Changes

- Added value-free operator completion brief aliases for `latestCompletedPlan`, `latestCompletedPlanNumber`, `userFacingCompletion`, `remainingCompletion`, `currentFirstBlockerAlias`, `currentNextCommand`, `currentNextCommandAlias`, and `currentOperatorStartCommandAlias`.
- Added a seven-row User-Facing Operator Aliases table to the operator brief Markdown/JSON receipt, plus row-count/value-free self-checks and console output.
- Extended QA string coverage so alias fields, Markdown sections, and validation messages are required by `npm run qa`.
- Documented that the operator completion brief mirrors the same final-report aliases used by completion-summary refresh.

## Validation

- Passed: `node --check harness/scripts/run_release_operator_completion_brief_smoke.mjs`.
- Passed: `npm run qa`.
- Passed: `git diff --check`.
- Passed: `npm run build`.
- Passed: approved-GUI `npm run release:source-evidence-refresh-smoke`; regenerated 21/21 source artifacts and exercised Electron project IO/package/install evidence.
- Passed: `npm run release:operator-completion-brief-smoke`; receipt printed `latestCompletedPlan: plan-1398`, `userFacingCompletion: 99.999999%`, `remainingCompletion: 0.000001%`, `currentNextCommandAlias: npm run release:prepare-env`, and `currentOperatorStartCommandAlias: npm run release:prepare-env`.
- Passed: `npm run release:progress-refresh-smoke`; refreshed progress/current-blocker/completion-packet/freshness/operator-brief evidence and proved the operator brief alias path inside the full refresh.
- Passed: approved-GUI `npm run desktop:launch-smoke`; launched the live Electron app, mounted the renderer, sampled nonblank pixels, and exercised first-time composer/professional producer Quick Actions.
- Note: the first direct operator brief smoke failed before source evidence existed in the worktree, and the first full progress refresh exposed a `releaseChannelMetadataPosture` return bug introduced during editing. Both were fixed and rerun to passing evidence.

## Decision Log

- Started after plan-1398 added stable aliases to completion summary refresh while the operator completion brief still required consumers to map internal fields when preparing the final external handoff.
- Kept operator completion brief aliases derived from completion-report-packet/current-blocker inputs instead of reading completion-summary-refresh output, avoiding a circular dependency in the progress refresh chain.
