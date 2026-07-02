# plan-1285-external-completion-run-packet

## Goal

Add a value-free external completion run packet that gives the operator one current, ordered command receipt for clearing the remaining external distribution blockers after local app readiness is already proven.

## Scope

- Add a local-only smoke command that refreshes the current completion summary and existing external operator packet evidence, then emits one value-free run packet under ignored build output.
- Include current blocker, current proof command, post-clearance next action, downstream proof packet commands, hard gate command, completion percentage, and 10-plan progress.
- Keep all private release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity values, channel values, and local env values out of console, Markdown, JSON, and committed files.
- Update docs, package scripts, and static QA expectations for the new run packet.

## Outcome

- Added `npm run release:external-completion-run-packet-smoke`.
- Added `harness/scripts/run_release_external_completion_run_packet_smoke.mjs`, which refreshes completion summary, update-feed edit packet, update-metadata publish packet, and Developer ID operator packet evidence in order.
- The new packet writes ignored Markdown/JSON artifacts with five source rows, four refresh rows, 12 ordered external completion run rows, current completion blocker action/focus rows, completion percentage, remaining percentage, current blocker, current next command, current env edit target, and hard-gate posture.
- The packet does not run `npm run release:external-check`, does not record private values, does not probe networks, does not publish update feeds, does not sign artifacts, does not submit to Apple, and does not claim auto-update or external distribution completion.
- Updated README, release readiness docs, harness architecture, quality rules, package scripts, and static QA coverage.
- Fixed the `release:next-actions` bootstrap/source-missing path so post-edit verification always includes the placeholder-clear expected signal and the release-channel post-edit operator receipt carries the strict proof chain, doctor proof, current-blocker refresh, next-actions refresh, and hard-gate boundary rows even before source evidence exists.

## Validation

- `node --check harness/scripts/run_release_external_completion_run_packet_smoke.mjs`
- `node --check harness/scripts/run_release_next_actions.mjs`
- `npm run qa`
- `npm run verify`
- `npm run release:external-completion-run-packet-smoke`
- `git diff --check`

## Decision Log

- 2026-07-02: Started after `plan-1284` added the release-channel setup wizard. The remaining completion gap is operator-owned external distribution proof, so this plan focuses on reducing the operational gap without recording private values or claiming external readiness.
- 2026-07-02: The first focused run exposed stale/bootstrap source evidence behavior in `release:next-actions`; fixed that path so the proof bundle and completion summary refresh chain can regenerate value-free receipts from a fresh worktree after `npm run verify`.
- 2026-07-02: Completed with local release evidence and packet smoke passing. Overall product completion remains `99.999999%`; the remaining `0.000001%` is external/private distribution proof: ignored local env setup, release/support/feed/channel values, Developer ID signing, notarization/stapling, Gatekeeper, manual QA approval, distribution-channel QA, leak audit, and final `npm run release:external-check`.
