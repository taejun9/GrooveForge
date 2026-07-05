# plan-1402-resume-unblock-aliases

## Objective

Mirror the value-free operator unblock alias contract from the after-work completion summary into the external completion run and resume packets, so a resumed operator handoff can identify the exact private release-channel edit target, first command, preflight/apply/strict proof path, and broad proof refresh command without re-reading the completion summary.

## Scope

- Add `operatorUnblock...` aliases to `npm run release:external-completion-run-packet-smoke`.
- Add matching `operatorUnblock...` aliases to `npm run release:external-completion-resume-packet-smoke`.
- Validate the aliases against the source completion summary, run packet, current operator command sequence, setup wizard handoff, and current private input placeholder rows.
- Update QA expectations and release/harness docs for resumed handoff reporting.
- Run actual app screen testing with `npm run desktop:launch-smoke` before completion reporting.

## Changes

- Added value-free `operatorUnblock...` alias rows and top-level fields to `harness/scripts/run_release_external_completion_run_packet_smoke.mjs`.
- Added the same alias contract to `harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`, sourced from the run packet with safe fallbacks to mirrored operator/setup-wizard fields.
- Added Markdown sections, console summaries, and validation checks proving alias alignment with current operator command rows, setup wizard handoff, current private input receipt, and placeholder-location summaries.
- Updated `harness/scripts/run_qa.py` so QA guards the new alias fields, validation messages, and Markdown output.
- Updated release readiness, quality, and harness architecture docs to require run/resume packet alias mirrors for resumed operator handoffs.

## Validation

- `node --check harness/scripts/run_release_external_completion_run_packet_smoke.mjs`
- `node --check harness/scripts/run_release_external_completion_resume_packet_smoke.mjs`
- `git diff --check`
- `npm run qa`
- `npm run release:source-evidence-refresh-smoke` with approved GUI/AppKit execution
- `npm run release:completion-summary-refresh-smoke`
- `npm run build`
- `npm run verify` with approved GUI/AppKit execution
- Actual app screen test covered by `npm run verify` via `npm run desktop:launch-smoke`: renderer `1440x928`, screenshot `2880x1856`, 37 required test ids, first-time composer and professional producer paths, and Quick Actions route evidence passed.

## Decision Log

- Started after plan-1401 exposed `operatorUnblock...` aliases in `npm run release:completion-summary-refresh-smoke`.
- Current main receipt is `plan-1401`, `1401-1410: 1/10`, 99.999999% complete, `operatorUnblockReceiptReady: true`, and the current blocker is four placeholder release-channel metadata rows in `.env.release-channel.local`.
- This plan will not create, infer, store, or print private release URLs, support URLs, channel values, feed values, credentials, Developer ID identities, or user audio.
- Source evidence refresh in the plan worktree found the current blocker as the missing ignored local distribution env scaffold, so the run/resume alias mirrors correctly point the first/start command and broad next command at `npm run release:prepare-env` while still exposing the private release-channel input template, setup wizard edit target, and preflight/apply/strict-proof path.
- Completion summary refresh and verify both regenerated the external completion run/resume packets and proved `operatorUnblockReceiptReady: true` without recording private values or claiming external distribution.
