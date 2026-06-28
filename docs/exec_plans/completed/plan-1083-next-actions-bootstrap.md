# plan-1083-next-actions-bootstrap

## Goal

Make `npm run release:next-actions` useful even from a clean checkout or a workspace where ignored release evidence has not been generated yet.

The current next-actions command is useful after external preflight evidence exists, but a fresh local workspace can fail before it can tell the operator the first concrete step. It should instead write a value-free bootstrap next-actions artifact that points to the evidence prerequisite without recording private values or weakening the hard external gate.

## Scope

- Update `run_release_next_actions.mjs` so missing source evidence becomes a bootstrap report instead of an opaque failure.
- Keep strict failure behavior for real preflight failures when source evidence is present.
- Keep generated Markdown/JSON under ignored `build/desktop/`.
- Preserve value-free and non-claiming posture.
- Update README, release readiness docs, harness docs, quality rules, and QA expectations.

## Out of Scope

- Filling private values, credentials, URLs, identity labels, tokens, channel metadata, or approval values.
- Developer ID signing, Apple notarization submission, stapling, Gatekeeper approval, release upload, update feed publish, remote probing, manual QA approval, or claiming external distribution completion.
- Changing product scope, direct-composition-first behavior, sampler/import features, project data, or app UI behavior.

## Plan

1. Completed: Scoped the clean-checkout next-actions bootstrap behavior.
2. Completed: Implement missing-evidence bootstrap reporting.
3. Completed: Update docs and QA expectations.
4. Completed: Run targeted QA and both missing-evidence/evidence-present next-actions paths.
5. Completed: Reviewed the change, moved this plan to completed, and created the review mirror.

## QA

- Passed: `node --check harness/scripts/run_release_next_actions.mjs`.
- Passed: `git diff --check`.
- Passed: `python3 -B harness/scripts/run_qa.py`.
- Passed: `npm run release:next-actions` in missing source evidence mode; generated a bootstrap report with `bootstrapMode: true`, `sourceEvidenceReady: false`, first action `npm run release:check`, and no private values recorded.
- Passed: `npm run verify`.
- Passed: `npm run release:next-actions` after `npm run verify`; regenerated the evidence-present report with `bootstrapMode: false`, `sourceEvidenceReady: true`, local release readiness 100%, current focus `Release channel metadata`, and no private values recorded.

## Decision Log

- 2026-06-29: Chose bootstrap reporting instead of requiring a prior release gate because the operator should get a concrete first command even when ignored release evidence is absent.

## Status

- Completed.
