# plan-1322-external-resume-summary

## Goal

Make the after-work completion refresh prove the latest external completion resume packet, so completion reports include the current value-free resume command and cannot go stale while the final private/external distribution step remains pending.

## Scope

- Refresh `npm run release:external-completion-resume-packet-smoke` from the release progress refresh receipt.
- Include the resume packet in release progress freshness rows and fail when its 10-plan progress label is stale or missing.
- Mirror resume packet readiness, next resume command, next proof command, current blocker, and hard-gate posture into completion summary refresh evidence.
- Keep all reporting value-free and preserve the no-claim external distribution boundary.

## Non-Goals

- Do not edit `.env.distribution.local` or private process env values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, update feed publishing, release upload, or external distribution completion.
- Do not change product UI, audio behavior, project schema, packaging, signing, or generated release artifacts beyond ignored evidence reports.

## Validation

- [x] `node --check harness/scripts/run_release_progress_refresh_smoke.mjs`
- [x] `node --check harness/scripts/run_release_progress_freshness_smoke.mjs`
- [x] `node --check harness/scripts/run_release_external_completion_run_packet_smoke.mjs`
- [x] `node --check harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`
- [x] `node --check harness/scripts/run_release_completion_summary_smoke.mjs`
- [x] `node --check harness/scripts/run_release_completion_summary_refresh_smoke.mjs`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke` after moving this plan to completed
- [x] `git diff --check`

## Decision Log

- 2026-07-03: Created after current main completion refresh passed but the external completion resume packet was only covered by `npm run verify`, not by the after-work completion refresh/freshness path used for user-facing completion reports.
- 2026-07-03: Added non-recursive existing-source modes to the external completion run and resume packets so completion summary refresh can regenerate them without calling itself.
- 2026-07-03: Mirrored the external completion resume packet into completion summary refresh evidence, including next resume command, next proof command, current blocker, hard-gate posture, value-free rows, and current operator first-command alignment.
- 2026-07-03: First fresh-worktree completion summary refresh correctly failed before full source release evidence existed. `npm run release:check` then regenerated the required source evidence and passed, followed by a successful completion summary refresh showing latest completed plan `plan-1321`, progress `1321-1330: 1/10`, completion `99.999999%`, remaining `0.000001%`, next resume command `npm run release:prepare-env`, and proof command `npm run release:private-edit-strict-proof`.
- 2026-07-03: After moving this plan to completed, completion summary refresh passed again and reported latest completed plan `plan-1322`, progress `1321-1330: 2/10`, completion `99.999999%`, remaining `0.000001%`, external resume packet ready, next resume command `npm run release:prepare-env`, next proof command `npm run release:private-edit-strict-proof`, and no external distribution claim.
