# plan-1353-audience-starter-projects

## Goal

Promote the verified first-time composer and professional producer smoke workflows into reusable app/domain audience starter projects, so beginners and working producers can create the same sample-free ready-to-edit project paths from the app instead of relying on harness-only recipes.

## Scope

- Add value-free domain helpers for first-time composer and professional producer audience starter projects.
- Wire visible/Quick Actions entry points that create those projects without changing remote behavior, sampling scope, or export behavior.
- Update workflow/persona/renderer smoke coverage to use and prove the shared audience starter project path.
- Keep the feature local-first and direct-composition centered.

## Non-Goals

- Do not imitate any named producer's protected style or claim artist-specific sound matching.
- Do not add sampling, imported audio, remote AI calls, accounts, analytics, cloud sync, release uploads, signing, notarization, or private distribution value handling.
- Do not change the completion percentage formula or claim external distribution completion.

## Validation

- [x] `npm run renderer:smoke`
- [x] `npm run workflow:smoke`
- [x] `npm run persona:smoke`
- [x] `npm run typecheck`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`
- [x] `npm run release:completion-summary-refresh-smoke`

Additional validation:

- [x] `npm run build`
- [x] `npm run release:check`

## Decision Log

- 2026-07-04: Created after plan-1352. The next goal-aligned local feature is to make the already-verified beginner/professional producer starter workflows part of the actual app/domain surface, not just harness-only setup code, while preserving direct event-based composition and no sampling-first behavior.
- 2026-07-04: Implemented shared `createAudienceStarterProject` domain helpers for first-time composer and professional producer starts, wired visible Audience Session Build Starter controls plus Quick Actions create commands, and updated renderer/workflow/persona smoke coverage to prove the app path uses those shared helpers.
- 2026-07-04: Updated product, harness, quality, and release readiness docs plus `run_qa.py` static expectations so the new starter path is guarded as local-first direct composition without protected style imitation, imported audio, remote services, or sampling-first setup.
