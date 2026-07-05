# plan-1401-operator-unblock-aliases

## Objective

Expose the current private release-channel unblock path as stable top-level aliases in the after-work completion summary refresh, so reports can distinguish the broad proof refresh command from the exact operator first command, edit target, preflight, apply, and strict proof steps needed to advance the remaining external/private release blocker.

## Scope

- Add value-free `operatorUnblock...` aliases to `npm run release:completion-summary-refresh-smoke`.
- Mirror the current blocker, private input edit target, expected shape summary, operator first/start command, preflight command, apply command, strict proof command, refresh command, and guided setup fallback.
- Validate those aliases against the existing Current Operator Command Sequence, real setup wizard handoff, placeholder input receipt, and private input placeholder rows.
- Update QA expectations and release/harness docs so after-work reports read the exact unblock path, not only the broad `currentNextCommandAlias`.
- Run actual app screen testing with `npm run desktop:launch-smoke` before completion reporting.

## Changes

- Added value-free `operatorUnblock...` aliases to `harness/scripts/run_release_completion_summary_refresh_smoke.mjs`.
- Mirrored the current blocker, broad next command, first/start operator command, private input edit target, expected input shape, template command/path, preflight, apply, strict proof, blocker refresh, next-actions refresh, guided fallback, and placeholder-location summary.
- Added validation that the aliases match the existing completion summary, Current Operator Command Sequence, setup wizard handoff, placeholder input receipt, and private input placeholder rows while recording no private values.
- Added console and Markdown output for the operator unblock alias receipt, including a dedicated `Operator Unblock Aliases` section.
- Updated `harness/scripts/run_qa.py`, `docs/architecture/harness.md`, and `docs/release/readiness.md` so QA and operator docs require the exact unblock alias path for after-work reports.

## Validation

- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- `git diff --check`
- `npm run qa`
- `npm run release:source-evidence-refresh-smoke` with approved macOS GUI/AppKit access
- `npm run release:completion-summary-refresh-smoke`
- `npm run build`
- `npm run desktop:launch-smoke` with approved macOS GUI/AppKit access
- `npm run verify` with approved macOS GUI/AppKit access

## Decision Log

- Started after plan-1400 pushed crash-report regression aliases into the completion refresh receipt. Current completion evidence is `plan-1400`, `1391-1400: 10/10`, 99.999999% complete, crash regression `15/15`, source artifacts `21/21`, and current blocker `Current action still contains 4 placeholder keys for required release-channel metadata.`
- The blocker requires operator-owned private release-channel values, so this plan will not invent or record those values. It will make the existing value-free operator path explicit and machine-readable for the next completion report.
- The plan worktree had no ignored local distribution env loaded after regenerating source evidence, so the refreshed receipt reported `operatorUnblockFirstCommandAlias: npm run release:prepare-env` and `operatorUnblockPrivateInputEditTarget` rows for `.env.release-channel.local`. This is expected for a value-free checkout and keeps the private values external to the repo.
