# plan-1374-audience-starter-followup-actions

## Goal

Make Audience Starter result feedback actionable for first-time composers and professional producers. After a visible Build Starter Project action creates a local starter, the result strip should expose follow-up buttons that route to the correct local checks without mutating project data, playback, export files, release state, remote services, or sampling scope.

## Scope

- Add visible Audience Starter result follow-up controls.
- First-time composer starter follow-ups should route to First Beat Path and Dual Audience Readiness.
- Professional producer starter follow-ups should route to Review Queue, Export Preflight, and Handoff Package Check.
- Extend the launch smoke evidence so the live Electron renderer proves the follow-up buttons are present and route to the expected local surfaces.

## Non-Goals

- Do not change starter project generation content.
- Do not add remote AI, accounts, analytics, cloud sync, sampling-first flow, or external distribution behavior.
- Do not record private values or real user audio.

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
| 2026-07-05 | project_lead | Use existing First Beat Path, Dual Audience Readiness, Review Queue, Export Preflight, and Handoff Package Check focus routes from the starter result strip instead of adding new project mutation or generation behavior. |
| 2026-07-05 | quality_runner | Initial sandboxed `npm run desktop:launch-smoke` was blocked by the macOS GUI guard as expected; approved GUI/AppKit reruns exposed stale mode-specific text expectations and follow-up evidence labels that omitted destination names. Updated launch smoke to require Mode Focus/Session Pass test ids instead of a fixed restored Guided mode, and prefixed follow-up click evidence with the destination surface. |
