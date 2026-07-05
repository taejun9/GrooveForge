# plan-1393-doctor-operator-gap

## Objective

Make the release doctor completion-gap readout point directly to the operator-owned first command for the remaining release-channel metadata blocker, while preserving the existing proof-refresh command semantics and value-free/private-data boundary.

## Scope

- Add explicit completion-gap operator start fields to `npm run release:doctor` JSON, Markdown, and console output.
- Keep `currentNextCommand` and completion-gap proof command behavior compatible with existing release evidence.
- Align `npm run release:source-evidence-prereq-smoke` operator first command with the proof bundle Current Operator Command Sequence before falling back to compact completion summary evidence.
- Add static QA expectations so the field contract cannot drift.
- Update release/harness docs for the new doctor readout.

## Out of Scope

- Editing `.env.release-channel.local` or `.env.distribution.local`.
- Recording release URLs, support URLs, channel values, credentials, tokens, identity labels, or local env values.
- Claiming Developer ID signing, notarization, Gatekeeper approval, auto-update, or external distribution completion.

## QA

- [x] `node --check harness/scripts/run_release_doctor.mjs`
- [x] `node --check harness/scripts/run_release_source_evidence_prereq_smoke.mjs`
- [x] `npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run release:doctor`
- [x] `npm run release:source-evidence-refresh-smoke` (approved GUI/AppKit context)
- [x] `npm run release:source-evidence-prereq-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`
- [x] `npm run desktop:launch-smoke` (approved GUI/AppKit context)

## Completion Criteria

- Release doctor artifacts expose a value-free completion-gap operator start command.
- The operator start command is `npm run release:channel-apply-private-env-preflight` when the release-channel placeholders remain.
- Completion summary refresh remains aligned with the current blocker and latest completed plan.
- Actual Electron launch smoke passes on screen.

## Decision Log

| Date | Agent | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Continue toward app completion by reducing ambiguity in the final operator-owned release-channel metadata handoff instead of editing private ignored env files. |
| 2026-07-05 | quality_runner | `release:completion-summary-refresh-smoke` exposed a no-env worktree mismatch where source-prereq kept the compact preflight command while proof-bundle/current evidence had advanced the first operator command to `npm run release:prepare-env`; fix source-prereq to prefer the proof bundle sequence. |
| 2026-07-05 | quality_runner | Verified actual Electron launch smoke in an approved GUI/AppKit context after the code and evidence changes. |

## Completion Notes

- `release:doctor` now exposes completion-gap operator command aliases while keeping the existing next proof command contract.
- `release:source-evidence-prereq-smoke` now derives its current operator first command from the proof bundle Current Operator Command Sequence before falling back to the compact completion summary.
- The worktree no-env completion refresh now passes with `currentOperatorFirstCommand: npm run release:prepare-env`; the main checkout with existing ignored env will be validated after merge.
