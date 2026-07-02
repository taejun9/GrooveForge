# plan-1294-preflight-operator-order

## Goal

Make every release-channel operator-facing handoff place `npm run release:channel-apply-private-env-preflight` before the write helper, so the remaining private metadata step is consistently value-free, verifiable, and less error-prone before strict proof.

## Scope

- Update release next-actions current operator action, action checklist, acceptance blockers, placeholder remediation, and post-edit receipt rows to mention the preflight before `npm run release:channel-apply-private-env`.
- Mirror the preflight-before-apply order into the external proof bundle, release progress/current-blocker receipts, and completion report packet validations.
- Update README, release readiness, harness architecture, and quality rules so durable operator guidance matches generated evidence.
- Keep all generated evidence value-free and avoid reading, writing, or printing private release URLs, channels, credentials, or local env values.

## Out of Scope

- Editing `.env.distribution.local` values.
- Providing release URLs, support URLs, distribution channel values, signing identities, notary credentials, or update feed metadata.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing beat-composition workflows, renderer UI, audio rendering, or project data.

## Validation

- `node --check harness/scripts/run_release_channel_edit_packet_smoke.mjs`
- `node --check harness/scripts/run_release_channel_setup_wizard.mjs`
- `node --check harness/scripts/run_release_completion_report_packet_smoke.mjs`
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `node --check harness/scripts/run_release_external_proof_bundle.mjs`
- `node --check harness/scripts/run_release_final_handoff.mjs`
- `node --check harness/scripts/run_release_final_handoff_success_redaction_smoke.mjs`
- `node --check harness/scripts/run_release_next_actions.mjs`
- `node --check harness/scripts/run_release_operator_completion_brief_smoke.mjs`
- `node --check harness/scripts/run_release_post_edit_proof_success_smoke.mjs`
- `node --check harness/scripts/run_release_private_edit_quick_proof_smoke.mjs`
- `node --check harness/scripts/run_release_private_edit_strict_proof.mjs`
- `node --check harness/scripts/run_release_progress_refresh_smoke.mjs`
- `node --check harness/scripts/run_release_progress_report.mjs`
- `npm run qa`
- `npm run release:channel-setup-wizard-success-smoke`
- `npm run release:channel-edit-packet-smoke`
- `npm run release:private-edit-quick-proof-smoke`
- `npm run release:check`
- `npm run release:completion-report-packet-smoke`
- `npm run release:progress-refresh-smoke`

## Decision Log

- 2026-07-02: Created after plan-1293 added the non-writing preflight but main completion evidence still showed some operator action/order strings that jumped from process env values directly to `release:channel-apply-private-env`. The next code-side improvement is to make the preflight the explicit write-before check in every compact handoff.
- 2026-07-02: Updated next-actions, current-blocker, progress, external proof bundle, private edit proofs, final handoff receipts, setup wizard, channel edit packet, completion packet, docs, and QA expectations so operator command rows place `npm run release:channel-apply-private-env-preflight` before `npm run release:channel-apply-private-env`.
- 2026-07-02: Fixed the reported completion-packet ordering bug where a substring-based `indexOf` comparison treated `npm run release:channel-apply-private-env` as appearing inside the preflight command. Completion packet validation now compares exact operator command row `order` values.
- 2026-07-02: `npm run release:check` required an unsandboxed rerun for the Electron launch smoke after the sandboxed run was blocked by macOS seatbelt GUI restrictions; the unsandboxed release check completed successfully without recording private release metadata.
