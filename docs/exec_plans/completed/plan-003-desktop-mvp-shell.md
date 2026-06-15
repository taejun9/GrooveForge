# plan-003-desktop-mvp-shell

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Complete GrooveForge as a desktop app that can satisfy working composers while staying easy for first-time composers.

## Goal

Create the first runnable desktop-app foundation for GrooveForge: an Electron + Vite + TypeScript shell with a real beat-workstation screen, local-first product boundaries, and validation commands.

## Non-Goals

- Claim the full professional-grade DAW is complete.
- Add cloud sync, accounts, analytics, payments, remote AI calls, or sample-first workflows.
- Build plugin hosting, advanced sample chopping, or native DSP.

## Requirements

- Desktop-first runnable shell.
- First screen is the actual beat workstation, not a marketing page.
- UX must support beginner ease and professional control.
- Core flow stays beat creation across genres: drums, 808/bass, melody/chords, arrangement, mixer/master, export.
- Sampling remains a later add-on.

## Context Map

- `README.md`: public commands and product framing.
- `package.json`: app scripts.
- `electron/`: desktop main/preload processes.
- `src/`: renderer app, domain model, audio/workstation UI.
- `docs/product/product.md`: product contract.
- `docs/architecture/product-architecture.md`: layer map and stack.
- `harness/scripts/run_qa.py`: base and app file checks.

## Constraints

- QA and review are separate loops.
- Do not create or use `docs/plan`.
- Future feature work should continue from `plan-004-*`.
- Desktop shell must keep node integration disabled in renderer.
- No real user audio or copyrighted fixtures.

## Implementation Plan

- [x] Create task worktree and active plan.
- [x] Add Electron/Vite/TypeScript app skeleton.
- [x] Implement first workstation screen with transport, patterns, instruments, arrangement, mixer/master, and export controls.
- [x] Add domain fixtures for all-genre style profiles and beginner/pro modes.
- [x] Update README and official source registry.
- [x] Extend QA checks for app files and scripts.
- [x] Install dependencies and run validation.
- [x] Complete plan and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm install`: passed, 0 vulnerabilities reported.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run qa`: passed.
- `npm run verify`: passed.
- `npm run desktop`: built and launched Electron; process stayed running until manually stopped with SIGINT after launch confirmation.

## Review Plan

QA completed before review. Review mirror is recorded in `docs/reviews/plan-003-desktop-mvp-shell-review.md`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Use Electron for the first desktop shell. | Electron official docs position it for cross-platform desktop apps using JavaScript, HTML, and CSS; it is the fastest route from the current web-first base to a runnable desktop MVP. |
| 2026-06-15 | Use Vite + TypeScript for renderer/build. | Vite provides a fast modern dev server/build tool and TypeScript keeps event/project models explicit. |
| 2026-06-15 | Keep node integration disabled and context isolation enabled. | The renderer should stay local-first and not receive broad desktop privileges by default. |
| 2026-06-15 | Use a real workstation first screen. | The user wants an app, not a landing page; the initial surface must expose beat-making controls immediately. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Opened plan for the desktop MVP shell. |
| 2026-06-15 | repo_cartographer | Added Electron, Vite, TypeScript, renderer UI, domain model, audio preview, and WAV export files. |
| 2026-06-15 | harness_builder | Updated README, architecture, official sources, quality rules, and QA checks for the app runtime. |
| 2026-06-15 | quality_runner | Ran QA, typecheck, build, verify, browser rendering checks, and Electron launch check. |
| 2026-06-15 | review_judge | Review mirror created with residual risks and next steps. |

## Completion Notes

The repository now contains a runnable desktop-app foundation. It is not yet the full professional-grade DAW requested by the long-term goal, but it moves the product from docs-only to a desktop MVP shell with real beat-workstation controls, preview playback, and WAV export code.
