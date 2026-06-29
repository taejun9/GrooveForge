# plan-1154-persona-package-reopen

## Goal

Prove that the first-time composer and professional producer persona delivery packages can be reopened and verified from disk after generation, so readiness covers durable local deliverables rather than only freshly generated in-memory package rows.

## Scope

- Extend persona readiness smoke to reopen each persona delivery package from ignored `build/desktop/` artifacts.
- Verify manifest paths, file hashes, project roundtrip, WAV/MIDI headers, Handoff sections, artifact counts, and value-free posture for each persona package.
- Add persona package reopen rows and aggregate readiness to persona readiness JSON, Markdown, console output, release progress summaries, and current-blocker receipts.
- Update release readiness, quality rules, and QA expectations for the new durable package-reopen evidence.

## Out of Scope

- Changing product UI, project schema, playback scheduling, render math, export file formats, signing, notarization, Gatekeeper approval, upload, remote update feeds, accounts, analytics, payments, cloud sync, or private release metadata.
- Recording private values, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, real user audio, or artist-specific endorsements.

## Plan

1. Inspect existing local package reopen smoke and persona package report shape.
2. Add per-persona package reopen validation to persona readiness smoke.
3. Mirror reopen readiness into release progress/current-blocker evidence.
4. Update QA contracts and release readiness docs.
5. Run QA, complete the plan, create the review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `node --check harness/scripts/run_persona_readiness_smoke.mjs` passed.
- `node --check harness/scripts/run_release_progress_report.mjs` passed.
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run persona:smoke` passed, including two persona delivery package reopen rows with `8/8` artifacts verified for first-time composer and professional producer packages.
- `npm run release:progress` passed with escalated GUI permission for hidden Electron BrowserWindow smokes. A sandboxed attempt failed at `desktop:launch-smoke` with Electron `SIGABRT`; the same launch smoke and full release progress gate passed once run with macOS GUI session access.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Reopen persona packages inside persona readiness smoke after package generation. | Reopen proof should be tied to the same two persona workflows and ignored package artifacts that prove target-user readiness. |
| 2026-06-30 | Keep reopen rows value-free and path/hash focused. | The proof needs durable file integrity without recording private values, private beats, release metadata, or user audio. |
| 2026-06-30 | Run desktop launch-bearing release QA with escalated GUI permission. | macOS AppKit hidden-window smokes abort under the command sandbox before app code runs, while the same smokes pass with GUI session access. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1151-1160: 3/10`, and current external blocker `.env.distribution.local:10-13` release-channel placeholders on main. |
| 2026-06-30 | harness_builder | Added persona package reopen validation for manifest paths, SHA-256 checksums, project roundtrip, WAV/MIDI headers, Handoff sections, artifact counts, local-first posture, sampling-secondary posture, and value-free posture. |
| 2026-06-30 | plan_keeper | Mirrored package reopen readiness into persona readiness, release progress, current-blocker receipts, QA expectations, quality rules, and release readiness docs. |
| 2026-06-30 | quality_runner | Confirmed persona reopen rows in `npm run persona:smoke` and full `npm run release:progress`; current worktree progress remains `1151-1160: 3/10` until this plan is moved to completed. |
