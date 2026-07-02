# plan-1295-release-channel-operator-command

## Goal

Make the remaining release-channel metadata blocker expose the next operator-owned command path separately from the post-edit proof command, so the final private metadata step points directly to `npm run release:channel-apply-private-env-preflight` and `npm run release:channel-apply-private-env` without changing the value-free evidence boundary.

## Scope

- Add value-free current-operator command fields/rows for release-channel placeholder cleanup in next-actions, current-blocker, progress, completion report, and completion summary evidence.
- Keep `currentNextCommand`/proof command semantics compatible with existing proof refresh flows where needed, but label the operator preflight/apply commands explicitly.
- Update README, release readiness, harness architecture, quality rules, and QA expectations to document the operator/proof command split.
- Preserve privacy: no private release URLs, support URLs, channels, credentials, local env values, signing identities, notary credentials, uploads, or external release completion claims.

## Out of Scope

- Editing `.env.distribution.local` values.
- Supplying release URLs, support URLs, distribution channels, update feed values, signing identities, or notary credentials.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing beat-composition workflows, renderer UI, audio rendering, project data, or release package artifacts.

## Validation

- `node --check harness/scripts/run_release_next_actions.mjs`
- `node --check harness/scripts/run_release_external_proof_bundle.mjs`
- `node --check harness/scripts/run_release_progress_report.mjs`
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `node --check harness/scripts/run_release_progress_refresh_smoke.mjs`
- `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- `node --check harness/scripts/run_release_completion_report_packet_smoke.mjs`
- `python3 -m py_compile harness/scripts/run_qa.py`
- `npm run qa`
- `npm run release:next-actions`
- `npm run release:check`
- `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-02: Created after plan-1294 proved preflight-before-apply ordering but completion/current-blocker evidence still used `npm run release:doctor` as the compact current next command while the real operator-owned placeholder cleanup starts with `npm run release:channel-apply-private-env-preflight`. The next improvement is to split operator action commands from proof refresh commands in value-free evidence.
- 2026-07-02: Added a value-free `Current Operator Command Sequence` to release next-actions, external proof bundle, progress, current-blocker, progress refresh, completion summary, completion summary refresh, and completion report packet evidence. The sequence now keeps `currentNextCommand` proof refresh semantics intact while exposing the operator-owned command path: prepare ignored env when missing, private env preflight, private env apply, strict proof, current-blocker, then next-actions.
- 2026-07-02: Gated current-operator sequence readiness to the active `release-channel-metadata` action so source-missing/bootstrap evidence can still pass without claiming release-channel metadata rows are currently actionable.
- 2026-07-02: Expanded docs and QA expectations so release evidence must preserve value-free operator rows, require preflight before apply, require apply before strict proof, and avoid private values in generated reports.
- 2026-07-02: `npm run release:check` required an unsandboxed rerun for the Electron launch smoke after the sandboxed run was blocked by macOS seatbelt GUI restrictions; the unsandboxed release check completed successfully without recording private release metadata.
