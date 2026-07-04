# plan-1347-completion-refresh-placeholder-receipt

## Goal

Make `npm run release:completion-summary-refresh-smoke` self-sufficient on a fresh root checkout by ensuring its progress-refresh source generates the real value-free `release:channel-placeholder-input-receipt` artifact before `release:current-blocker-smoke` consumes existing evidence.

## Scope

- Add `npm run release:channel-placeholder-input-receipt` to the `release:progress-refresh-smoke` refresh sequence before `npm run release:current-blocker-smoke`.
- Update self-checks, QA expectations, and release documentation so the command order is explicit and stable.
- Re-run the completion-summary refresh/smoke path from root conditions that include the ignored local env placeholder state.

## Non-Goals

- Do not edit `.env.distribution.local`, `.env.release-channel.local`, release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or real user audio.
- Do not run remote distribution probes, release uploads, update-feed publishing, Apple notarization, Developer ID signing, or the final external hard gate.
- Do not change the external distribution completion percentage or claim external distribution readiness.

## Validation

- [x] `npm run verify`
- [x] `npm run release:progress-refresh-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:completion-summary-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`

## Decision Log

- 2026-07-04: Created after root main post-merge validation found `release:completion-summary-refresh-smoke` could fail on a fresh source bundle because `release:progress-refresh-smoke` reached existing-evidence `release:current-blocker-smoke` before generating `release-channel-placeholder-input-receipt.json`.
- 2026-07-04: Added `npm run release:channel-placeholder-input-receipt` to `release:progress-refresh-smoke` immediately before `npm run release:current-blocker-smoke`, so current-blocker can always consume a real value-free placeholder-input receipt from the same refresh run.
- 2026-07-04: Updated QA and docs to require the nine-command refresh order: proof bundle, external distribution gate, update-feed checkpoint, progress, placeholder input receipt, current blocker, completion report packet, freshness, operator completion brief.
- 2026-07-04: Validated the fresh-source path after `npm run verify` regenerated release evidence. The target smokes now report `Placeholder input receipt ready: yes` with `missing-private-input-file` in the isolated worktree and no private values recorded.
