# plan-1395-source-prereq-private-placeholders

## Objective

Fix the release source evidence prerequisite report so current private input placeholder file/line locations are preserved even when the compact completion summary is missing or stale.

## Scope

- Keep the change limited to value-free release evidence handoff reporting.
- Do not write ignored private env files, record private values, probe networks, upload releases, sign, notarize, or claim external distribution.
- Preserve the existing current command aliases and source artifact prerequisite map.
- Prove the app still launches through the actual Electron screen test.

## Changes

- Added current blocker and placeholder input receipt reads to the source evidence prerequisite smoke.
- Recovered current private input placeholder location rows from the completion summary first, then proof bundle, current blocker, and placeholder input receipt.
- Added value-free placeholder location rows plus source labels to the prereq JSON, Markdown, console output, and self-checks.
- Updated QA text expectations and release harness documentation.

## Validation

- `node --check harness/scripts/run_release_source_evidence_prereq_smoke.mjs` passed.
- `npm run release:source-evidence-prereq-smoke` passed in a source-missing worktree context.
- `npm run qa` passed.
- `npm run build` passed.
- `git diff --check` passed.
- `npm run desktop:launch-smoke` passed against the live production Electron app screen.
- `npm run release:source-evidence-refresh-smoke` passed with 44/44 commands and 21/21 source artifacts present.

## Decision Log

- Started after the source evidence prereq report could show `Current private input placeholder locations: 0 (none)` even though current release evidence still had ignored private input placeholder rows.
- Chose a source-priority fallback instead of weakening the prereq report: completion summary rows stay first, but proof bundle, current blocker, and placeholder input receipt rows preserve the operator edit target when the compact summary is absent or stale.
