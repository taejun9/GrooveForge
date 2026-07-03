# plan-1312-audience-completion-route

## Goal

Add an Audience Completion Route readout so first-time composers and professional producers can see the current beat's completion and delivery posture from the same local surface before jumping to final checks.

## Scope

- Add a read-only Audience Completion Route strip near the existing Audience Session and Dual Audience Readiness surfaces.
- Derive beginner and producer completion rows from existing local First Beat Path, Beat Readiness, Session Pass, Production Snapshot, Export Preflight, and Handoff Package Check signals.
- Add Quick Actions route readout and direct lane commands that reuse existing First Beat Path, Export Preflight, Production Snapshot, and Handoff Package Check focus handlers.
- Add Command Reference coverage for the route readout and both audience completion lanes.
- Extend renderer and desktop launch smoke coverage so the new route is visible, searchable, and executable without mutating project data except existing explicit focus/jump behavior.

## Non-Goals

- Do not edit `.env.distribution.local` or record private release values.
- Do not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion.
- Do not add remote AI, cloud sync, analytics, accounts, payments, network probes, upload, signing, notarization, or external distribution behavior.
- Do not imitate a specific producer's protected style; keep producer support framed as workflow, mix, handoff, and delivery readiness.
- Do not add sampling-first, audio import, chopping, sampler setup, or imported-audio dependencies.

## Validation

- [x] `npm run typecheck`
- [x] `npm run renderer:smoke`
- [x] `npm run desktop:launch-smoke`
- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run release:check`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1311. The latest completion evidence keeps the user-facing completion at `99.999999%` with `0.000001%` left for external/private distribution proof. This plan improves in-app completion routing for beginners and working producers without requiring private distribution values.
- 2026-07-03: Implemented the Audience Completion Route readout and Quick Actions. Desktop launch smoke initially exposed two harness issues: completion lane queries used `lane` while the action titles used `completion`, and the expanded live palette evidence set made the 30s palette evidence timeout flaky. The harness now uses action-specific completion queries and a 60s palette evidence timeout.
- 2026-07-03: Completed QA and release summary refresh. Latest completed plan is `plan-1312`; current 10-plan progress is `1311-1320: 2/10`; user-facing completion remains `99.999999%` with `0.000001%` remaining. Current first blocker remains `Ignored local distribution env file is not loaded.` and the current operator first command is `npm run release:prepare-env`.
