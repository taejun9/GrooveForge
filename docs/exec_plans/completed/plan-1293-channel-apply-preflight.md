# plan-1293-channel-apply-preflight

## Goal

Add a value-free preflight path for the release-channel private env apply helper so an operator can verify the four required process env values are present and shape-valid before writing the ignored local env file or running strict proof. Also close the attached macOS Squirrel dyld launch-crash report by making the package smoke sign and verify the local app bundle before launch.

## Scope

- Add a non-writing `release:channel-apply-private-env-preflight-smoke` path that validates process env readiness and existing ignored env placeholder/current posture without recording private values.
- Keep `npm run release:channel-apply-private-env` as the write path and preserve `npm run release:private-edit-strict-proof` as the recommended proof chain after apply.
- Update current blocker/completion docs and QA expectations so future agents can point to the preflight before the apply/write step.
- Make `npm run desktop:package-smoke` apply a launch-only local ad-hoc signature, verify the copied `.app`, and keep Squirrel/ReactiveObjC/Mantle dyld dependency validation ahead of packaged launch.

## Out of Scope

- Editing `.env.distribution.local` values.
- Providing real distribution URLs, support URLs, release channels, credentials, signing identities, or notary credentials.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing beat composition, audio generation, project schema, or UI behavior.
- Claiming Developer ID signing, notarization, Gatekeeper approval, or external distribution from the local package-smoke signature.

## Validation

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

## Decision Log

- 2026-07-02: Created after current-blocker refreshed on main and showed `.env.distribution.local` exists but the four release-channel metadata keys are still placeholders. The next code-side progress is a value-free preflight that lets the operator confirm process env readiness before applying private values.
- 2026-07-02: Folded in the attached macOS crash report showing `@rpath/Squirrel.framework/Squirrel` dyld failure from an older build path. The package-smoke path now normalizes the freshly copied local `.app` with a launch-only ad-hoc signature before dependency validation and launch, without claiming Developer ID signing.
