# plan-1378-release-channel-proof-smoke-gate

## Goal

Make the existing release-channel private-env proof smoke part of the main local release gate. The next operator-owned release-channel metadata step should be covered by `npm run verify` without recording private values or claiming external distribution.

## Scope

- Add `npm run release:channel-apply-private-env-proof-smoke` to the `verify` release-channel command sequence.
- Update harness/quality documentation so the proof smoke is treated as a required local gate step.
- Update QA guard expectations to prevent the proof smoke from drifting out of `verify`.
- Run focused release proof checks and actual app launch smoke before reporting completion.

## Non-Goals

- Do not replace operator-owned private release-channel values.
- Do not edit real ignored `.env.distribution.local` or `.env.release-channel.local` values.
- Do not probe networks, upload releases, publish update feeds, sign artifacts, submit to Apple, or claim auto-update/external distribution completion.
- Do not change composition, sampler, device, mixer, or project data behavior.

## Context Map

- `package.json`
- `harness/scripts/run_release_channel_apply_private_env_proof.mjs`
- `harness/scripts/run_release_channel_apply_private_env_proof_smoke.mjs`
- `harness/scripts/run_qa.py`
- `README.md`
- `docs/quality/rules.md`
- `docs/architecture/harness.md`

## Constraints

- QA and review are separate loops.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1378-release-channel-proof-smoke-gate` and `.worktree/plan-1378-release-channel-proof-smoke-gate`.
- Keep the app local-first and direct-composition-first.
- Actual screen behavior must be verified through Electron launch smoke before final reporting.

## Implementation Plan

- [x] Confirm current release-channel proof scripts and verify sequence.
- [x] Add proof smoke to `verify` after the private-env success smoke.
- [x] Update docs and QA guard strings for the gated proof smoke.
- [x] Run focused QA, proof smoke, and actual Electron launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `npm run qa`
- `npm run release:channel-apply-private-env-proof-smoke`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Review Plan

QA completes before review starts.

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Strengthen the release-channel proof gate next because the current completion blocker is operator-owned release-channel metadata and the one-command proof smoke already exists but is not part of `verify`. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | project_lead | Started plan-1378 from clean main after plan-1377; current overall completion remains `99.999999%` with 4 private release-channel metadata placeholders as the external blocker. |
| 2026-07-05 | harness_builder | Added `npm run release:channel-apply-private-env-proof-smoke` to the `verify` release-channel sequence after the private-env apply success smoke, then updated README, harness architecture, quality rules, and QA guard strings. |
| 2026-07-05 | quality_runner | Passed `npm run qa`, `npm run release:channel-apply-private-env-proof-smoke`, `npm run build`, approved GUI `npm run desktop:launch-smoke`, and `git diff --check`. |
| 2026-07-05 | review_judge | Review found no follow-up code changes required; remaining blocker is still operator-owned private release-channel metadata. |
