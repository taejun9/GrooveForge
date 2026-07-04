# plan-1367-audience-route-bridge

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

Continue completing GrooveForge for working producers like 천재노창 or GroovyRoom and first-time composers, report overall completion after each completed work, and test by running the actual app and checking behavior on screen.

## Goal

Make the first-run audience workflow more immediately actionable by adding a visible Audience Route Bridge that connects the current Audience Session lane, Dual Audience Readiness priority, and Audience Completion Route priority into one compact next-step surface for first-time composers and professional producers.

## Non-Goals

- Add remote AI, accounts, analytics, cloud sync, payments, ads, or external services.
- Add sampling-first workflows, imported audio requirements, protected producer imitation, or style-copying behavior.
- Change project schema, audio rendering, playback, export file formats, or release private-value handling.
- Claim external distribution readiness.

## Context Map

- `src/ui/workstationGuidancePanels.tsx`
- `src/ui/workstationAppQuickActions.tsx`
- `src/ui/workstationShellPanels.tsx`
- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `harness/scripts/run_desktop_launch_smoke.mjs`
- `docs/product/product.md`
- `docs/quality/rules.md`

## Constraints

- QA and review are separate loops.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1367-audience-route-bridge` and `.worktree/plan-1367-audience-route-bridge`.
- Keep the feature local, value-free, and direct-composition first.
- Actual screen behavior must be verified through an app launch smoke before final reporting.

## Implementation Plan

- [x] Inspect existing Audience Session, Dual Audience Readiness, Audience Completion Route, Quick Actions, Command Reference, and launch-smoke evidence.
- [x] Add an Audience Route Bridge readout/control surface that summarizes active audience, next readiness action, completion action, audition cue, and next check.
- [x] Expose the bridge through Quick Actions/Command Reference and launch-smoke evidence.
- [x] Update docs and QA expectations.
- [x] Run focused QA, build, and actual app launch smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `git diff --check`

## QA Result

- `npm run qa` passed.
- `npm run build` passed.
- `npm run desktop:launch-smoke` passed against the production Electron app with DOM, Quick Actions, and screenshot evidence.
- Final `npm run qa` passed.
- `git diff --check` passed.

## Review Result

Review completed after QA. No blocking issues found.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-04 | Add a compact audience bridge instead of a new tutorial flow. | Existing audience surfaces are already strong; a bridge reduces navigation friction without changing project data, playback, export, or sampling scope. |
| 2026-07-04 | Reuse existing focus/jump routes for bridge actions. | The bridge should guide first-time composers and professional producers without adding new project mutation, playback, export, remote, or sampling behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-04 | project_lead | Started plan-1367 from clean `main` after plan-1366 completion. |
| 2026-07-04 | harness_builder | Added Audience Route Bridge UI, Quick Actions, Command Reference coverage, launch-smoke evidence, and product/quality docs. |
| 2026-07-04 | quality_runner | Passed `npm run qa`, `npm run build`, actual `npm run desktop:launch-smoke`, rerun `npm run qa`, and `git diff --check`. |
