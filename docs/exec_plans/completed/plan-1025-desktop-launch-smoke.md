# plan-1025-desktop-launch-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue building GrooveForge until it is usable by working producers and first-time composers, with progress reported after each completed work item.

## Goal

Add an automated live Electron launch smoke that proves the production desktop app can start, load the real renderer, expose the bounded desktop bridge, and show the first-run beginner/pro direct beat workstation surfaces.

## Non-Goals

- Do not add installer packaging, code signing, notarization, auto-update, accounts, cloud sync, analytics, payments, remote AI, or sampling-first scope.
- Do not replace the existing renderer, workflow, runtime, or desktop entry smokes.
- Do not require a visible manual GUI session for the release gate.

## Context Map

- `electron/main.ts` owns the production BrowserWindow, preload bridge loading, native menu, and renderer file entry.
- `harness/scripts/run_desktop_entry_smoke.mjs` statically verifies the built Electron entry and preload contracts.
- `harness/scripts/run_renderer_smoke.mjs` server-renders the first-run React app but does not launch Electron.
- `docs/release/readiness.md` says the current gate covers desktop entry without launching a visible GUI.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge all-genre and direct-composition-first; sampling remains optional and outside the MVP spine.

## Implementation Plan

- [x] Add a smoke-only Electron launch path guarded by an environment variable.
- [x] Add a `desktop:launch-smoke` harness script that builds are assumed present, starts Electron, captures structured smoke output, and fails on timeout or renderer errors.
- [x] Verify live DOM evidence for transport, guided path, studio path, compose/sound/arrange/mix/master, export, and desktop preload bridge.
- [x] Wire the launch smoke into `verify` and document it in README, harness architecture, quality rules, and release readiness.
- [x] Extend QA expectations so the new script and docs remain covered.

## QA Plan

- `git diff --check`
- `npm run desktop:launch-smoke`
- `python3 harness/scripts/run_qa.py`
- `npm run release:check`

## Review Plan

QA completes before review starts. Review the launch smoke for bounded environment-gated behavior, deterministic timeout/error handling, no user-facing behavior changes outside smoke mode, and preservation of local-first and sampling-secondary constraints.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Add a live Electron launch smoke instead of a wider UI refactor. | The release evidence gap is runtime desktop renderer proof; static entry checks and SSR already cover neighboring contracts. |
| 2026-06-28 | Set Vite `base: "./"` and tighten desktop entry smoke to reject root-relative assets. | The first live launch showed production `file:` loading reached `dist/index.html` but React could not mount because `/assets/...` pointed at the filesystem root instead of the built `dist/assets` directory. |
| 2026-06-28 | Compile the Electron preload as `.cts` -> `preload.cjs`. | The live launch exposed that sandboxed Electron preload execution rejects ESM `import` syntax in `preload.js`, leaving `window.grooveforge` unavailable. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created. |
| 2026-06-28 | harness_builder | Added live desktop launch smoke and fixed production Electron asset loading to use relative built asset paths. |
| 2026-06-28 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run desktop:smoke`, `npm run desktop:launch-smoke`, and `npm run release:check` passed. |

## Completion Notes

Added `npm run desktop:launch-smoke` to start the production Electron app in smoke mode, keep the BrowserWindow hidden, verify `window.grooveforge`, confirm the mounted first-run beginner/pro workstation DOM, and reject sampling-first copy. The live smoke exposed and fixed two production desktop blockers: Vite now emits `./assets` paths for Electron `file:` loading, and the preload compiles as `electron/preload.cts` -> `dist-electron/preload.cjs` so Electron's sandboxed preload environment can load the desktop bridge.
