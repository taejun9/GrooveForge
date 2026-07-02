# plan-1293-channel-apply-preflight Review

## Findings

- No blocking findings.

## QA

- `node --check harness/scripts/run_desktop_package_smoke.mjs`
- `node --check harness/scripts/run_desktop_entry_smoke.mjs`
- `node --check harness/scripts/run_release_channel_apply_private_env.mjs`
- `node --check harness/scripts/run_release_channel_apply_private_env_preflight_smoke.mjs`
- `python3 -m py_compile harness/scripts/run_qa.py`
- `npm run qa`
- `npm run build`
- `npm run release:channel-apply-private-env-preflight-smoke`
- `npm run release:channel-apply-private-env-success-smoke`
- `npm run desktop:package-smoke`
- `npm run release:check`
- `npm run release:completion-summary-refresh-smoke`

## Summary

- Added a value-free `npm run release:channel-apply-private-env-preflight` command and a synthetic preflight smoke so release-channel process env readiness can be checked before writing `.env.distribution.local`.
- Kept the existing private env apply path as the write path and mirrored the preflight command into current-blocker, progress refresh, completion summary, release doctor, docs, and QA expectations.
- Hardened `npm run desktop:package-smoke` against the attached Squirrel dyld launch-crash class by applying and verifying a launch-only local ad-hoc signature before dependency validation and app launch.
- Preserved the local-only boundary: the new package-smoke signature does not claim Developer ID signing, notarization, Gatekeeper approval, upload, or external distribution completion.

## Residual Risk

- External distribution remains blocked on operator-owned private release metadata, update feed configuration, Developer ID/notarization/Gatekeeper evidence, manual QA approval, and the hard external gate. This plan intentionally did not record private values, edit real release URLs, perform network probes, submit to Apple, or claim external distribution completion.
