# plan-1311-dual-audience-command-route

## Goal

Expose the Dual Audience Readiness strip through Quick Actions and Command Reference so first-time composers and professional producers can discover the same readiness route from the command palette before switching lanes or jumping to delivery checks.

## Scope

- Add a read-only Quick Actions route readout for Dual Audience Readiness that summarizes both lanes from existing local readiness signals.
- Add direct Quick Actions lane commands for the first-time composer and professional producer readiness lanes, routed through the same existing visible handlers as the strip buttons.
- Add Command Reference coverage so command-map users can find the Dual Audience Readiness route, beginner lane, and producer lane without running commands first.
- Update renderer/persona/desktop launch smoke coverage to require the new command-palette and command-map signals.
- Keep the feature local, value-free, event-first, and read-only except for explicit existing lane navigation/focus handlers.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not add remote AI, analytics, cloud sync, accounts, payments, upload, signing, notarization, or external distribution behavior.
- Do not add sampling-first, audio import, chopping, sampler setup, or imported-audio dependencies.
- Do not imitate a specific producer's protected style; keep professional support framed as workflow readiness, delivery posture, and editable beat production.

## Validation

- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run renderer:smoke`
- [x] `npm run persona:smoke`
- [x] `npm run desktop:launch-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1310. Current main evidence reports latest completed plan `plan-1310`, 10-plan progress `1301-1310: 10/10`, user-facing completion `99.999999%`, and remaining external/private release proof `0.000001%`. This plan improves in-app dual-audience discoverability without requiring private distribution values.
- 2026-07-03: Desktop launch smoke exposed two route issues while validating the new Quick Actions coverage: generic route readouts could outrank Audience Session entry commands for audience searches, and hidden-window visual capture could stall while waiting on renderer animation frames. The implementation now uses intent-specific launch-smoke queries, restores Guided mode after palette route checks, records the last launch-smoke stage on timeout, and uses a main-process paint settle before screenshot capture.
- 2026-07-03: Final completion summary refresh passed after the plan moved to completed. The report shows latest completed plan `plan-1311`, 10-plan progress `1311-1320: 1/10`, user-facing completion `99.999999%`, remaining completion `0.000001%`, and current first blocker `Ignored local distribution env file is not loaded.`
