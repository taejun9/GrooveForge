# plan-1327-placeholder-operator-start-command

## Goal

Make the current release-channel placeholder blocker expose a clear value-free operator start command without changing the broader `npm run release:doctor` proof/refresh command contract.

## Scope

- Add or surface a distinct operator start command for the release-channel placeholder state.
- Keep `currentActionNextCommand`/current next proof command aligned with the existing broader `npm run release:doctor` consensus where required by quality rules.
- Ensure current-blocker, next-actions, completion/progress summaries, and docs distinguish proof refresh from the private-input start/apply path.
- Keep all output value-free and do not read, record, or commit private URL/channel/credential values.

## Non-Goals

- Do not replace real operator-owned release-channel metadata.
- Do not write or overwrite `.env.distribution.local`.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, release upload, update feed publishing, or external distribution completion.
- Do not change product UI, audio behavior, project schema, signing, notarization, upload behavior, or real release artifacts.

## Validation

- [x] Targeted syntax checks for changed harness scripts (`node --check harness/scripts/run_release_doctor.mjs`)
- [x] Targeted release placeholder/operator command smoke commands (`npm run release:doctor`, `npm run release:prepare-env-write-smoke`, and placeholder-env `npm run release:doctor`)
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:check`
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after plan-1326 proved the prepare-env write branch. Current evidence can now load an ignored local env scaffold, so the remaining release-channel blocker is the four placeholder metadata keys; the next improvement is to distinguish the broad proof refresh command from the concrete operator start command for replacing/applying those placeholders.
