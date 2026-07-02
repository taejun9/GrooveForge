# plan-1294-preflight-operator-order Review

## Findings

- No blocking findings.

## QA

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

## Summary

- Put `npm run release:channel-apply-private-env-preflight` before `npm run release:channel-apply-private-env` across release next-actions, current-blocker/progress receipts, external proof bundles, setup wizard evidence, channel edit packets, completion report packets, private edit proofs, final handoff receipts, docs, and QA expectations.
- Expanded setup wizard proof so the command chain is prepare, private metadata preflight, private metadata apply, strict live-check, then private-edit strict proof.
- Fixed the reported completion-packet operator ordering bug by validating exact command row order instead of using substring `indexOf`, where the apply command is part of the preflight command string.
- Preserved the value-free release boundary: no private URLs, channels, credentials, local env values, signing identities, notary credentials, uploads, or external release completion claims were recorded.

## Residual Risk

- External distribution remains blocked on operator-owned private release metadata, update feed configuration, Developer ID/notarization/Gatekeeper evidence, manual QA approval, and the hard external gate.
- The current code-side handoff now points operators through the preflight before the write helper, but applying real values still must happen locally through ignored env/process env surfaces.
