# plan-1415-audience-session-acceptance

## Goal

Add a first-run Audience Session Acceptance strip so first-time composers and professional producers can see what counts as a finished local session before export/handoff proof.

## Scope

- Add a read-only Audience Session Acceptance surface inside the first-run Audience Session Readout.
- Show both audience lanes with acceptance target, evidence set, delivery proof posture, and next check.
- Add Quick Actions for the acceptance readout plus first-time composer and professional producer acceptance lanes.
- Extend renderer smoke, live desktop launch smoke, Electron expected DOM checks, TypeScript launch evidence types, static QA expectations, and relevant docs.
- Run the actual Electron app UI launch smoke after implementation.

## Out of Scope

- Changing generation, audio rendering, export packaging, delivery bundle contents, project schema, saved project data, playback, release-channel metadata, signing, notarization, auto-update, or external distribution.
- Filling `.env.release-channel.local`, `.env.distribution.local`, or any private release-channel value.
- Claiming external distribution completion.

## Decision Log

- 2026-07-06: Started after plan-1414 added the Audience Session Proof Handoff. Completion remains blocked by operator-owned release-channel metadata placeholders, so this plan advances the app-facing readiness path without touching private release inputs.
- 2026-07-06: Kept Acceptance read-only and routed lane actions only to existing Export Preflight deliverables and Handoff Package Check receipt focus paths.

## Completed Work

- Added `Audience Session Acceptance` rows for first-time composer and professional producer lanes with acceptance target, evidence set, proof posture, and next-check evidence.
- Added Quick Actions for the acceptance readout plus beginner and producer acceptance lanes.
- Extended renderer smoke, live desktop launch smoke, Electron expected DOM checks, TypeScript launch evidence types, and static QA expectations.
- Updated README, product, harness, quality, and release-readiness docs to include the new acceptance surface.

## Validation Log

- PASS: `node --check harness/scripts/run_renderer_smoke.mjs`
- PASS: `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- PASS: `npm run typecheck`
- FAIL then fixed: `npm run renderer:smoke` initially failed because the smoke fixture detail lacked the exact Export Preflight and Handoff Package Check strings expected in Acceptance metrics; updated the fixture to match the real command detail.
- PASS: `npm run renderer:smoke`
- PASS: `npm run qa`
- PASS: `npm run build`
- PASS: `npm run desktop:launch-smoke` with the actual production Electron app UI, hidden BrowserWindow, live DOM checks, Acceptance Quick Actions route/lane evidence, and screenshot pixel evidence.
- PASS: `git diff --check`
- PASS: `npm run release:source-evidence-refresh-smoke` with source artifacts present 21/21, latest completed plan `plan-1415`, and no private values recorded.
- PASS: `npm run release:completion-summary-refresh-smoke` with latest completed plan `plan-1415`, user-facing completion `99.999999%`, remaining completion `0.000001%`, and current first blocker `Ignored local distribution env file is not loaded.`

## Completion Notes

- The first-run Audience Session path now shows an acceptance standard before proof handoff: beginners see the guided 8-bar finished-session standard and producers see the studio handoff-pass standard.
- This plan does not advance the external-distribution blocker because release-channel metadata placeholders, signing/notarization, channel QA, and distribution proof remain operator-owned inputs.
