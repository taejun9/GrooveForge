# plan-1405-private-input-ready-gate

## Goal

Make the release-channel private input handoff expose a single value-free ready gate that tells an operator when the ignored `.env.release-channel.local` rows are shape-ready to apply, so the remaining external completion blocker is easier to clear without recording private metadata values.

## Scope

- Add a focused release-channel private input ready gate smoke/artifact.
- Surface the ready gate command and readiness in completion/current blocker evidence where operators resume the external release pass.
- Update harness/release/quality docs and package scripts for the new gate.
- Validate with QA, build, completion refresh, and the real app screen launch smoke.

## Out of Scope

- Filling private release-channel values.
- Probing release URLs, publishing update feeds, uploading releases, signing, notarizing, or claiming external distribution completion.
- Changing product UI, beat-generation behavior, project schema, or sampling scope.

## Decision Log

- Start from the existing non-writing preflight and placeholder input receipt so the new gate remains value-free and avoids duplicating private value parsing rules.
- Keep `npm run release:channel-apply-private-env-preflight` as the primary first operator command; the ready gate is a concise evidence/checkpoint alias around the same source.

## Completion Criteria

- A new ready gate command reports private input ready/missing/placeholder/invalid posture without recording values.
- Existing completion/current blocker handoffs point to the ready gate without replacing the preflight/apply/strict-proof order.
- `npm run qa`, `npm run build`, `npm run release:completion-summary-refresh-smoke`, and `npm run desktop:launch-smoke` pass.
- The plan is moved to `docs/exec_plans/completed/` with a review mirror under `docs/reviews/`.

## Validation Log

- `node --check` passed for the new ready gate script plus the updated current-blocker, progress-refresh, and completion-summary release scripts.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run release:channel-private-input-ready-gate-smoke` passed with a value-free placeholder-blocked fixture.
- `npm run release:channel-private-input-ready-gate-ready-smoke` passed with a value-free ready-to-apply fixture.
- `npm run release:channel-private-input-ready-gate` passed for the current real tree with missing private input rows reported as `0/4/0/0`.
- `npm run release:source-evidence-refresh-smoke` passed with GUI/AppKit approval to refresh ignored source evidence for this worktree.
- `npm run release:progress-refresh-smoke` passed with the ready gate in the refresh chain.
- `npm run release:completion-summary-refresh-smoke` passed with the ready gate mirrored into completion evidence.
- `npm run qa` passed.
- `npm run build` passed.
- `git diff --check` passed.
- `npm run desktop:launch-smoke` passed with a live Electron screen smoke, 37 required test ids, 75 sampled colors, and beginner/professional producer Quick Actions paths.
- `npm run verify` passed, including actual Electron launch, project I/O, packaged app, DMG/PKG, install, release evidence, and completion-report packet checks.

## Completion Notes

- Added `release:channel-private-input-ready-gate` plus blocked and ready smoke fixtures so operators can verify ignored `.env.release-channel.local` readiness without exposing values.
- Current-blocker, progress, and completion summary evidence now carry ready-gate mode, counts, blocked locations, and next commands while preserving the preflight/apply/strict-proof order.
- `npm run verify` now guards the ready gate and its docs/QA contracts before distribution private-input evidence.
- No private release-channel values were added, recorded, uploaded, probed, signed, notarized, or claimed as externally distributed.
