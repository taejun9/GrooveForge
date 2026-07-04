# plan-1375-audience-starter-command-reference-smoke

## Goal

Prove the Audience Starter command-map discovery path in the actual Electron app. First-time composers and professional producers should be able to find the Audience Starter row in Command Reference, see starter creation and follow-up route context, and hand off to Quick Actions without mutating project data, playback, export files, release state, remote services, or sampling scope.

## Scope

- Add launch-smoke evidence for the live Command Reference Audience Starter row.
- Verify Command Reference search can find Audience Starter and exposes Build Starter Project, both audience targets, follow-up routes, result metric context, and direct-composition posture.
- Verify the Audience Starter command-map row can hand off to Quick Actions in the actual app surface.

## Non-Goals

- Do not change starter project generation content.
- Do not add remote AI, accounts, analytics, cloud sync, sampling-first flows, or external distribution behavior.
- Do not record private values, real user audio, release URLs, support URLs, feed URLs, credentials, or channel values.

## QA

- [x] `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- [x] `npm run qa`
- [x] `npm run build`
- [x] `npm run renderer:smoke`
- [x] `npm run desktop:launch-smoke`
- [x] `npm run desktop:project-io-smoke`
- [x] `git diff --check`

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Extend actual Electron launch-smoke coverage for the existing Audience Starter Command Reference row instead of adding a new creation flow. |
| 2026-07-05 | quality_runner | Initial live Command Reference collection through a React hook timed out in the hidden Electron window. Moved the Command Reference check to Electron DOM button/input clicks and reduced launch-smoke palette collector UI state churn, then reran the actual app launch smoke successfully. |
