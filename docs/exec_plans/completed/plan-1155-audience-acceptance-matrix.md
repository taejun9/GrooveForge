# plan-1155-audience-acceptance-matrix

## Goal

Make target-user readiness easier to audit by adding a value-free audience acceptance matrix that proves first-time composers and professional producers each have rendered UI signals, workflow evidence, local deliverable packages, package reopen verification, and export/Handoff readiness.

## Scope

- Add per-audience acceptance rows to persona readiness JSON, Markdown, and console output.
- Mirror audience acceptance readiness, row counts, summaries, and value-free rows into release progress and current-blocker receipts.
- Update quality rules, release readiness docs, and QA expectations for the acceptance matrix.
- Keep completion reporting aligned with the existing `99.999999%` posture and the external release-channel blocker.

## Out of Scope

- Changing product UI, project schema, playback, render math, export file formats, signing, notarization, Gatekeeper approval, release upload, remote update feeds, accounts, analytics, payments, cloud sync, or private release metadata.
- Recording private values, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, real user audio, or artist-specific endorsements.

## Plan

1. Inspect persona readiness, release progress, and current-blocker report shapes.
2. Add audience acceptance matrix rows and validation to persona readiness smoke.
3. Mirror acceptance matrix evidence into release progress/current-blocker reports.
4. Update QA contracts and release readiness docs.
5. Run QA, complete the plan, create the review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `node --check harness/scripts/run_persona_readiness_smoke.mjs`
- `node --check harness/scripts/run_release_progress_report.mjs`
- `node --check harness/scripts/run_release_current_blocker_smoke.mjs`
- `python3 -m py_compile harness/scripts/run_qa.py`
- `python3 harness/scripts/run_qa.py`
- `npm run persona:smoke`
- `npm run release:progress`
- `npm run release:progress-smoke`
- `npm run release:current-blocker-smoke`
- `git diff --check`

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Add acceptance rows as value-free report evidence instead of app UI. | The current objective needs stronger target-user proof without changing musical behavior or adding private release values. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started from `99.999999%` completion, `1151-1160: 4/10`, and current external blocker `.env.distribution.local:10-13` release-channel placeholders on main. |
| 2026-06-30 | harness_builder | Added value-free audience acceptance rows for rendered path, workflow, package, package reopen, and export/Handoff evidence. |
| 2026-06-30 | harness_builder | Mirrored audience acceptance readiness, row counts, row summaries, and rows into release progress and current-blocker receipts. |
| 2026-06-30 | quality_runner | Full `npm run release:progress` passed with 10 audience acceptance rows, current completion `99.999999%`, and worktree blocker `npm run release:prepare-env` because ignored local env evidence is absent in this worktree. |
