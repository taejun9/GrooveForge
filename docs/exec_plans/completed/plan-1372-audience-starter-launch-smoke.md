# plan-1372-audience-starter-launch-smoke

## Status

completed

## Owner

project_lead / harness_builder / quality_runner

## User Request

Continue completing GrooveForge for working producers like 천재노창 or GroovyRoom and first-time composers, report overall completion after each completed work, and test by running the actual app and checking behavior on screen.

## Goal

Strengthen the actual Electron launch smoke so it proves the visible Audience Starter controls for first-time composers and professional producers are present and can create editable local starter projects with value-free result evidence.

## Non-Goals

- Add, infer, print, or commit private release-channel values.
- Attempt distribution channel probes, release uploads, signing, notarization, Gatekeeper approval, manual QA approval, auto-update publishing, accounts, analytics, cloud sync, payments, ads, or external services.
- Change project schema, playback, rendering, export formats, sampling scope, or remote behavior.
- Claim external distribution completion.

## Context Map

- `harness/scripts/run_desktop_launch_smoke.mjs`
- `electron/main.ts`
- `src/ui/App.tsx`
- `src/ui/workstationGuidancePanels.tsx`
- `src/vite-env.d.ts`
- `docs/product/product.md`
- `docs/quality/rules.md`

## Constraints

- QA and review are separate loops.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1372-audience-starter-launch-smoke` and `.worktree/plan-1372-audience-starter-launch-smoke`.
- Keep the app local-first and direct-composition-first.
- Actual screen behavior must be verified through Electron launch smoke before final reporting.

## Implementation Plan

- [x] Inspect existing launch smoke evidence for Audience Starter coverage.
- [x] Add value-free launch smoke evidence for visible beginner and producer starter buttons and creation results.
- [x] Update type definitions and Electron launch smoke checks.
- [x] Run focused QA, build, and actual Electron launch/project IO smoke.
- [x] Move plan to completed, create review mirror, and prepare merge/push completion reporting.

## QA Plan

- `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `npm run desktop:project-io-smoke`
- `npm run release:completion-summary-refresh-smoke`
- `git diff --check`

## Review Plan

QA completes before review starts.

## QA Result

Passed:

- `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke` with approved macOS GUI/AppKit access. This verified the live Electron first-run surface, required 33 test ids, screenshot pixel evidence, Audience Session, Audience Starter visible beginner/producer starter creation, Audience Route Bridge, Dual Audience Readiness, Audience Completion Route, and workstation export controls.
- `npm run desktop:project-io-smoke` with approved macOS GUI/AppKit access. Native `saveProject`/`openProject` roundtrip matched.
- `git diff --check`

Partial:

- `npm run verify` was run with approved macOS GUI/AppKit access and passed quality gate, renderer, workflow, persona, runtime, local delivery package/reopen/ZIP, bundle ZIP, typecheck, build, desktop entry, crash regression, actual Electron launch/project IO, packaged app, packaged project IO, ad-hoc signing, hardened runtime readiness, DMG, PKG, PKG payload launch/project IO, simulated install launch/project IO, and release evidence smokes up through the release progress refresh path. It then stopped with `ENOSPC: no space left on device` while rewriting persona readiness artifacts during `release:progress-smoke`. The generated ignored `build/` directory was removed and the focused build/QA/actual app smokes were rerun successfully.
- `npm run release:completion-summary-refresh-smoke` was attempted after moving this plan to completed, but the worktree copy had just removed ignored `build/` source release evidence to recover disk space, so the refresh correctly failed with source-evidence-missing guidance. The final completion summary refresh is deferred to the merged `main` checkout where source evidence is retained.

## Review Result

No blocking findings. The launch smoke now proves that the visible Audience Starter buttons are present for both first-time composers and professional producers, that the matching Quick Actions are available, and that each starter creation returns value-free result metrics and follow-up guidance. The change does not alter project schema, playback, rendering, export formats, release-channel private values, or remote behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-05 | Add Audience Starter coverage to the actual Electron launch smoke. | The visible controls already exist and are central to the beginner/professional producer promise, but the launch smoke required route/readiness surfaces without requiring starter creation evidence. |
| 2026-07-05 | Keep the Audience Starter smoke local and value-free. | The test should prove local starter creation and follow-up guidance without recording private values or adding any remote/release behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-05 | project_lead | Started plan-1372 from a clean main after completion summary identified only private release-channel placeholders as the remaining external blocker. |
| 2026-07-05 | harness_builder | Added launch smoke evidence for visible Audience Starter beginner/producer buttons and starter creation result metrics. |
| 2026-07-05 | quality_runner | Passed focused QA, build, actual Electron launch/project IO, and diff checks; full verify was environment-limited by disk space after app/package/release evidence smokes had progressed. |
| 2026-07-05 | review_judge | Reviewed local-first/value-free boundaries and no blocking findings were found. |
