# plan-1292-private-env-apply-summary

## Goal

Make the remaining private release-channel step more directly actionable in completion/current-blocker evidence by promoting the existing value-free `release:channel-apply-private-env` helper into top-level summaries and validation checks.

## Scope

- Keep real private values, release URLs, support URLs, channel values, credentials, signing, notarization, upload, network probes, and external distribution claims out of committed files and reports.
- Update release current-blocker and completion summary evidence so the apply-private-env helper is visible as the current operator action when release-channel metadata placeholders remain.
- Preserve the strict proof sequence: apply private env values first, then run `npm run release:private-edit-strict-proof`.
- Update QA expectations and durable docs so future agents can verify the operator action handoff without reading or recording private values.

## Out of Scope

- Editing `.env.distribution.local` values.
- Providing real distribution URLs, Developer ID identities, notary credentials, or release-channel values.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, upload, app-store submission, or external distribution completion.
- Changing beat composition, audio generation, project schema, or UI behavior.

## Validation

- `node --check harness/scripts/run_release_progress_refresh_smoke.mjs`
- `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 -m py_compile harness/scripts/run_qa.py`
- `npm run release:completion-summary-refresh-smoke`
- JSON field inspection for release progress refresh, completion summary, completion summary refresh, and current-blocker reports: `releaseChannelPrivateEnvApplyCommand` is `npm run release:channel-apply-private-env`, `releaseChannelPrivateEnvApplyBeforeStrictProof` is `true`, and `releaseChannelPrivateEnvApplyValueRecorded` is `false`.
- `python3 harness/scripts/run_qa.py`
- `npm run release:check`

## Decision Log

- 2026-07-02: Created after plan-1291 completed with overall completion still at `99.999999%`; the remaining `0.000001%` is external/private release proof, and the next safe code-side improvement is to make the existing value-free private-env apply command harder to miss in completion evidence.
- 2026-07-02: Promoted `npm run release:channel-apply-private-env` into release progress refresh, completion summary, completion summary refresh, and current-blocker evidence as a value-free apply step before strict proof.
- 2026-07-02: Fixed two completion-summary-refresh runtime regressions by mapping `releaseChannelPrivateEnvApplyCommand` and `releaseChannelPrivateEnvApplyRole` explicitly from the value-free helper constants, then reran the targeted summary refresh and full release check successfully.
