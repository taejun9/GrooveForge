# plan-1335-readme-real-preflight

## Goal

Align the README's operator-facing completion-summary refresh guidance with the current real operator preflight receipt behavior, so after-work completion reporting documentation does not describe the pre-plan-1334 command order.

## Scope

- Update the README `release:completion-summary-refresh-smoke` description to include the real `release:channel-apply-private-env-preflight` readout after the synthetic external resume packet and before the conditional 10-plan checkpoint.
- Update the after-work reporting guidance to cite the real operator preflight receipt fields: exit status, local env loaded posture, private input file presence, loaded-key count, missing/placeholder/invalid input counts, next write/proof commands, and no-modification/no-claim posture.
- Add or adjust QA expectations so the README cannot drift back to the stale four-step/conditional-fifth description.

## Non-Goals

- Do not change release scripts, release artifacts, local env files, app UI, audio behavior, project schema, signing, notarization, uploads, or external distribution behavior.
- Do not record private release URL, support URL, channel, credential, token, Developer ID identity, local env value, beat, or user audio values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, or external distribution completion.

## Validation

- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`

## Decision Log

- 2026-07-04: Created after plan-1334 made the completion-summary refresh leave a real operator preflight readout, while README still described the previous four-step refresh plus conditional fifth checkpoint order.
- 2026-07-04: Updated the README after-work command order and reporting guidance, then added QA strings so the README must mention the real fifth preflight readout, the real operator preflight counts, no ignored-env modification, and no external distribution claim.
- 2026-07-04: Refreshed local release evidence after preparing ignored placeholder env files in the feature worktree; the completion summary refresh now records the real operator preflight as expected-blocked with private input file present, four loaded placeholder keys, no local env modification, no private values, and no external distribution claim.
