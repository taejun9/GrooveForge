# plan-1283-release-channel-apply-handoff

## Goal

Make the current release-channel handoff tell operators to apply private metadata through `npm run release:channel-apply-private-env` instead of stale manual edit language, while keeping all receipts value-free and using launch/package/install smoke coverage for the attached Electron/AppKit startup abort report.

## Scope

- Update release next-actions, proof bundle, progress, current-blocker, final handoff, operator completion brief, private edit quick proof, and private edit strict proof receipts so the first private metadata apply command is `npm run release:channel-apply-private-env`.
- Update README, harness architecture, release readiness, quality rules, and QA string checks so public/operator docs match the current apply-helper workflow.
- Preserve privacy and release boundaries: no URL/channel/private values in committed files or generated proof summaries, no network probes, no signing, no Apple notary submission, no upload, and no external distribution completion claim.
- Treat the attached Electron `EXC_CRASH (SIGABRT)` / AppKit-HIServices startup abort as launch-path regression input and verify it through the current desktop launch, packaged app launch, PKG payload launch, and simulated install launch smoke checks.
- Treat the attached GrooveForge `DYLD Library missing` / `@rpath/Squirrel.framework/Squirrel` startup abort as package integrity regression input and require packaged, PKG payload, and simulated install smokes to verify Electron runtime framework presence and strict code-sign validity before launch.

## Validation

- `git diff --check`
- `node --check harness/scripts/run_release_next_actions.mjs`
- `node --check harness/scripts/run_release_progress_report.mjs`
- `node --check harness/scripts/run_release_external_proof_bundle.mjs`
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `node --check harness/scripts/run_release_operator_completion_brief_smoke.mjs`
- `node --check harness/scripts/run_release_final_handoff_success_redaction_smoke.mjs`
- `node --check harness/scripts/run_release_private_edit_quick_proof_smoke.mjs`
- `node --check harness/scripts/run_release_private_edit_strict_proof.mjs`
- `node --check harness/scripts/desktop_bundle_dependency_guard.mjs`
- `node --check harness/scripts/run_desktop_package_smoke.mjs`
- `node --check harness/scripts/run_desktop_pkg_payload_smoke.mjs`
- `node --check harness/scripts/run_desktop_install_smoke.mjs`
- `python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1283-run_qa.pyc', doraise=True)"`
- `npm run qa`
- `npm run release:prepare-env`
- `npm run desktop:package-smoke`
- `npm run desktop:adhoc-sign-smoke`
- `npm run desktop:dmg-smoke`
- `npm run desktop:pkg-smoke`
- `npm run desktop:pkg-payload-smoke`
- `npm run desktop:install-smoke`
- `npm run release:channel-edit-packet-smoke`
- `npm run release:completion-report-packet-smoke`
- `npm run verify`
- `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-02: Started from the remaining release-channel placeholder blocker after `plan-1282` added the private apply helper; the next correctness issue was stale handoff/proof language still implying direct manual placeholder editing.
- 2026-07-02: Chose to keep the compatible proof row label `Private value edit` where downstream receipts expect it, but changed its command and expected evidence to the apply helper so operator-facing proof order is unambiguous.
- 2026-07-02: Full `npm run verify` passed after preparing the ignored local env scaffold in this worktree. The attached Electron `EXC_CRASH (SIGABRT)` startup abort was not reproduced by `desktop:launch-smoke`, packaged launch, PKG payload launch, or simulated install launch.
- 2026-07-02: Added a shared Electron bundle dependency guard after the second attached report showed dyld aborting before app startup on `@rpath/Squirrel.framework/Squirrel`; packaged, PKG payload, and simulated install smokes now fail before launch if required Electron runtime frameworks are missing or fail `codesign --verify --strict`.
- 2026-07-02: Aligned the completion report packet proof-role self-check with the channel edit packet so both receipts describe the private env helper path; `npm run release:completion-summary-refresh-smoke` now passes with 99.999999% user-facing completion, 0.000001% remaining, and 1281-1290 at 3/10 completed plans.
