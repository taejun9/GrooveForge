# plan-1349-completion-guided-fallback

## Goal

Make the remaining release-channel private input blocker easier for first-time operators to clear by surfacing the value-free guided setup fallback command in the current blocker and completion summary readouts.

## Scope

- Mirror `npm run release:channel-setup-wizard` from existing setup/preflight evidence into current-blocker, progress-refresh, completion-summary, and completion-summary-refresh reports.
- Preserve the source-driven first operator command as `npm run release:prepare-env` while the ignored env scaffold is missing or `npm run release:channel-apply-private-env-preflight` once the scaffold exists; the guided setup wizard remains a fallback, not the primary command sequence.
- Update QA and release docs so after-work completion reports include the fallback command without recording private values.

## Non-Goals

- Do not edit `.env.distribution.local`, `.env.release-channel.local`, release URLs, support URLs, feed URLs, channel values, credentials, tokens, Developer ID identities, or real user audio.
- Do not run remote distribution probes, release uploads, update-feed publishing, Apple notarization, Developer ID signing, or the final external hard gate.
- Do not change the external distribution completion percentage or claim external distribution readiness.

## Validation

- [x] `npm run release:current-blocker-smoke`
- [x] `npm run release:progress-refresh-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run release:completion-summary-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`
- [x] `npm run verify` (rerun unsandboxed for Electron GUI/AppKit launch smoke after sandbox guard blocked the first `release:check` attempt)

## Decision Log

- 2026-07-04: Created after plan-1348 exposed private input file location summaries. The private-input command correctly remains the non-writing preflight once the ignored env scaffold exists, but the final readout should also show the guided setup wizard as the safe fallback for first-time operators when the four private release-channel inputs are missing or still placeholders.
- 2026-07-04: Surfaced `npm run release:channel-setup-wizard` through current-blocker, progress-refresh, completion-summary, and completion-summary-refresh while validating it remains value-free and outside primary Current Operator Command Sequence rows.
- 2026-07-04: Validation confirmed current worktree evidence reports `npm run release:prepare-env` as the current first command because `.env.distribution.local` is absent; the guided setup fallback is still available for the later private release-channel input step and is not promoted into the primary command rows.
