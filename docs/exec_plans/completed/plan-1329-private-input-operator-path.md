# plan-1329-private-input-operator-path

## Goal

Make release-channel blocked/resume/completion receipts show the value-free operator default private input file path in addition to the isolated blocked-smoke private input path, so the operator can prepare the real ignored `.env.release-channel.local` route without inspecting deeper code.

## Scope

- Add a value-free operator default private input file path to the release-channel private env preflight blocked smoke.
- Mirror that operator default path through the external completion resume packet and completion summary refresh receipt.
- Update QA expectations and release/quality docs so completion reporting requires the operator default path guidance.
- Keep the existing synthetic blocked-smoke path, current operator command, and proof command contracts unchanged.

## Non-Goals

- Do not create, edit, or commit `.env.release-channel.local` or `.env.distribution.local`.
- Do not record private URL, support URL, channel, credential, token, Developer ID identity, local env, beat, or user audio values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, or external distribution completion.
- Do not change product UI, audio behavior, project schema, release signing, notarization, uploads, or external release artifacts.

## Validation

- [x] Targeted syntax checks for changed harness scripts
- [x] Targeted release-channel blocked/resume/summary smoke commands
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:external-completion-resume-packet-smoke -- --from-existing-run-packet`
- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] JSON spot checks for operator default private input file path fields
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after main evidence showed the current external blocker remains four release-channel placeholder metadata keys. Plan-1328 exposed the private input file key/default/current blocked-smoke path and guided setup fallback, but the blocked-smoke current path is intentionally isolated under `build/desktop/`. Completion reports should also show the real operator default ignored path, `.env.release-channel.local`, without recording private values.
- 2026-07-03: Mirrored the operator default private input file path through the blocked preflight smoke, external completion resume packet, and completion summary refresh receipt. Targeted JSON checks show `.env.release-channel.local` in all three artifacts with the corresponding value-recorded flags false, while the isolated blocked-smoke missing input path remains separate.
