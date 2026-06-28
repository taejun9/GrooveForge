# plan-1051-distribution-local-env

## Status

complete

## Owner

project_lead / harness_builder

## User Request

천재노창이나 그루비룸같은 현직 작곡가들과 처음 작곡하는 사람들도 사용할 수 있도록 앱 제작 완료를 계속 진행하고, 작업이 끝날 때마다 전체 완성도를 보고한다.

## Goal

Add a safe local distribution environment input path so external-distribution smokes can consume an ignored `.env.distribution.local` file while committed files contain only redacted templates and validations.

## Non-Goals

- Do not commit private values, release/support/feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, or real user audio.
- Do not upload releases, publish update feeds, probe remote services, submit to Apple, or claim external distribution completion.
- Do not change project schema, UI workflow, audio rendering, export behavior, or optional sampling scope.
- Do not make sampling part of the MVP.

## Context Map

- `.gitignore`: ignores `.env.*` and allows only `.env.example`.
- `harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs`: validates required private input key presence without recording values.
- `harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs`: validates redacted distribution channel metadata.
- `harness/scripts/run_desktop_completion_audit_smoke.mjs`: reports local/external readiness.
- `docs/quality/rules.md`: QA contract for distribution smokes.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1051-distribution-local-env` and `.worktree/plan-1051-distribution-local-env`.
- The local env loader must never print or write private values.
- Template placeholders must not be accepted as real configured values.

## Implementation Plan

- [x] Add a shared local env loader that reads ignored `.env.distribution.local` plus optional `GROOVEFORGE_DISTRIBUTION_ENV_FILE` without overwriting already exported environment variables.
- [x] Add a committed redacted template under `harness/templates/`.
- [x] Add a smoke that validates the template, ignored local env posture, key coverage, placeholder rejection, redaction, and next local commands.
- [x] Wire the local env loader into distribution private-inputs, distribution-channel QA, and completion audit smokes.
- [x] Wire the template smoke into `npm run verify` before private-inputs.
- [x] Update README, quality rules, harness architecture, release readiness, QA expectations, review, and completion notes.

## QA Plan

- `git diff --check`
- `node --check harness/scripts/distribution_local_env.mjs`
- `node --check harness/scripts/run_desktop_distribution_env_template_smoke.mjs`
- `python3 harness/scripts/run_qa.py`
- `npm run desktop:distribution-env-template-smoke`
- `npm run desktop:distribution-private-inputs-smoke`
- `npm run release:check`

## Review Plan

Review starts only after QA completes.

## QA Results

- `git diff --check` passed.
- `node --check harness/scripts/distribution_local_env.mjs` passed.
- `node --check harness/scripts/run_desktop_distribution_env_template_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_distribution_private_inputs_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_distribution_channel_qa_smoke.mjs` passed.
- `node --check harness/scripts/run_desktop_completion_audit_smoke.mjs` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run desktop:distribution-env-template-smoke` passed and wrote value-free Markdown/JSON artifacts under ignored `build/desktop/`.
- `npm run desktop:distribution-private-inputs-smoke` passed with local env loaded: no, private values recorded: no.
- `npm run release:check` passed. Completion audit reported local MVP evidence ready: yes, local desktop package evidence ready: yes, redacted distribution evidence ready: yes, external distribution ready: no, completion audit ready: yes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add ignored local env file support plus a committed redacted template. | External distribution blockers are private inputs and manual approvals; a local ignored env file reduces operator friction without committing values. |
| 2026-06-28 | Keep the env template smoke value-free and non-blocking for missing local private values. | The committed repo can prove template coverage and redaction while external distribution still requires private operator inputs outside version control. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created for safe local distribution env input support. |
| 2026-06-28 | harness_builder | Added `distribution_local_env.mjs`, redacted env template, and `desktop:distribution-env-template-smoke`. |
| 2026-06-28 | harness_builder | Wired the local env loader into distribution-channel QA, distribution private-inputs, and completion audit smokes without recording values. |
| 2026-06-28 | quality_runner | `npm run release:check` passed with redacted distribution evidence ready and external distribution still not claimed. |

## Completion Notes

Completed. GrooveForge now has a committed redacted distribution env template, an ignored `.env.distribution.local` loading path, optional `GROOVEFORGE_DISTRIBUTION_ENV_FILE` support, a value-free env template smoke, documentation coverage, and QA expectations. External distribution remains blocked on real private release/support/update values, Developer ID identity, notary credentials/submission, notarization/stapling, Gatekeeper acceptance, update provider/feed/channel metadata, and manual channel QA approval.
