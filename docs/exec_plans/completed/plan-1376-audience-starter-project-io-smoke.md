# plan-1376-audience-starter-project-io-smoke

## Goal

Prove that both Audience Starter projects remain usable after native desktop save/open. First-time composers and professional producers should be able to build the local starter projects, then roundtrip them through the Electron project IO bridge with mode, style, key, BPM, arrangement length, delivery target, editable events, and direct-composition posture intact.

## Scope

- Extend the native desktop project IO smoke with first-time composer and professional producer Audience Starter fixtures.
- Save and reopen each fixture through the actual Electron preload bridge.
- Report value-free per-fixture evidence for audience, mode, style, key, BPM, bars, delivery target, editable event count, and SHA-256 match.
- Preserve existing single-project project IO evidence and release/privacy boundaries.

## Non-Goals

- Do not change starter project generation content.
- Do not add remote AI, accounts, analytics, cloud sync, sampling-first flows, or external distribution behavior.
- Do not record private values, real user audio, release URLs, support URLs, feed URLs, credentials, or channel values.
- Do not claim external distribution completion.

## Context Map

- `harness/scripts/run_desktop_project_io_smoke.mjs`
- `src/domain/workstation.ts`
- `docs/product/product.md`
- `docs/quality/rules.md`

## Constraints

- QA and review are separate loops.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1376-audience-starter-project-io-smoke` and `.worktree/plan-1376-audience-starter-project-io-smoke`.
- Keep the app local-first and direct-composition-first.
- Actual screen behavior must be verified through Electron launch/project IO smoke before final reporting.

## Implementation Plan

- [x] Inspect the current project IO smoke and Electron project IO result shape.
- [x] Add Audience Starter roundtrip fixtures and value-free checks.
- [x] Update generated Markdown/JSON report content and self-checks.
- [x] Run focused QA, build, and actual Electron launch/project IO smoke.
- [x] Move plan to completed, create review mirror, merge, push, and report completion.

## QA Plan

- `node --check harness/scripts/run_desktop_project_io_smoke.mjs`
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

- `node --check harness/scripts/run_desktop_project_io_smoke.mjs`
- `npm run qa`
- `npm run build`
- `npm run renderer:smoke`
- `npm run desktop:launch-smoke` with approved macOS GUI/AppKit access. This verified the live production Electron renderer, first-run beginner/professional audience surfaces, Audience Starter visible controls, Command Reference handoff, Quick Actions routes, workstation controls, and screenshot pixel evidence.
- `npm run desktop:project-io-smoke` with approved macOS GUI/AppKit access. This verified the native Electron `saveProject`/`openProject` bridge for the generic smoke beat plus first-time composer and professional producer Audience Starter projects.
- `git diff --check`

Audience Starter project IO evidence:

- First-time composer: `First Guided Beat`, guided, lofi, 86 BPM, A minor, 8 bars, Starter Sketch, 73 editable events.
- Professional producer: `Producer Fast Pass`, studio, house, 124 BPM, C minor, 26 bars, Beat Store, 112 editable events.

## Review Result

No blocking findings. Existing native project IO report fields remain intact for downstream completion evidence, and the new Audience Starter roundtrip evidence is additive. The actual Electron project IO smoke now proves both starter projects survive desktop save/open with audience mode, style, key, BPM, arrangement length, delivery target, editable event density, and value-free privacy posture intact.

## Decision Log

| Date | Owner | Decision |
|---|---|---|
| 2026-07-05 | project_lead | Extend native project IO evidence for Audience Starter projects because the visible app can create them, but the desktop save/open smoke still proves only a generic studio fixture. |
| 2026-07-05 | quality_runner | Keep the existing starter Session Brief content unchanged and make the project IO sampling-boundary check allow the direct-composition phrase `without imported audio` while still blocking sampling-first terms. |

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-07-05 | project_lead | Started plan-1376 from clean main after plan-1375; overall completion remains blocked only by private external release metadata, so this slice strengthens app-local starter usability evidence. |
| 2026-07-05 | harness_builder | Added reusable native project IO roundtrip helpers, Audience Starter fixtures, report rows, and QA catalog/README updates. |
| 2026-07-05 | quality_runner | Passed QA, build, renderer smoke, actual Electron launch smoke, actual Electron project IO smoke, and diff checks. |
