# plan-1115-release-next-actions-completion-gap

## Goal

Make the external release next-actions report state the remaining completion gap plainly, so the operator can see why the project is still below full external-distribution completion and which value-free proof target, command sequence, and blocker must be resolved next.

## Scope

- Add a value-free completion gap summary to the external next-actions JSON and Markdown reports.
- Include the current blocker, next proof target, next command, hard gate command, and not-claimed release posture in that summary.
- Keep private values, release URLs, credentials, tokens, Developer ID identity values, private beats, and real user audio out of generated artifacts.
- Keep GrooveForge positioned as an all-genre direct beat workstation; sampling remains optional and secondary.
- Update README and QA expectations for the new completion-gap fields.

## Out of Scope

- Performing external distribution, release upload, notarization submission, remote channel probing, Developer ID signing, app-store submission, or manual QA approval.
- Recording private release values or credentials.
- Changing app UI, audio generation, project data, export behavior, sampling scope, cloud sync, accounts, analytics, or payment features.

## Plan

1. Inspect the current external next-actions report shape and QA expectations.
2. Add completion-gap summary fields and Markdown/console output.
3. Update README and QA rule expectations.
4. Run focused release next-actions smoke and repository validation.
5. Move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Pass: `node --check harness/scripts/run_release_next_actions.mjs`
- Pass: `npm run release:next-actions`
- Pass: `npm run qa`
- Pass: `npm run desktop:launch-smoke` with escalated permissions after sandboxed Electron launch returned `SIGABRT`
- Pass: `npm run release:check` with escalated permissions; includes `npm run qa`, `npm run verify`, `npm run release:external-preflight`, and `npm run release:next-actions-smoke`
- Pass: `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-29 | Add value-free completion-gap summary to release next-actions instead of attempting external distribution. | The remaining project gap depends on private/external proof, so the local repo should clarify the exact next proof path without claiming completion. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-29 | project_lead | Plan created. |
| 2026-06-29 | harness_builder | Added value-free completion gap fields, Markdown section, console summary, and self-checks to release next-actions. |
| 2026-06-29 | repo_cartographer | Updated README, quality rules, and QA expectations for the completion gap contract. |
| 2026-06-29 | quality_runner | Ran syntax check, release next-actions bootstrap, QA, escalated desktop launch smoke, escalated release check, and diff whitespace checks. |
