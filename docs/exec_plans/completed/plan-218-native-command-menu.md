# plan-218-native-command-menu

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working composers/producers while remaining easy for beginners.

## Goal

Add a native Electron command menu that makes common desktop actions discoverable and routes menu commands into existing renderer actions for project files, edit history, transport, and Quick Actions.

## Non-Goals

- Do not add cloud sync, accounts, analytics, payment, remote AI, sampling, imported audio, plugin hosting, or new file formats.
- Do not change project schema, render/export contents, playback scheduling, save/open dialogs, or undo/redo semantics.
- Do not add destructive commands, background autosave, auto-export, or multi-command macros.

## Context Map

- `electron/main.ts` owns Electron window creation and existing save/open IPC handlers.
- `electron/preload.ts` exposes the safe renderer bridge.
- `src/vite-env.d.ts` types the renderer bridge.
- `src/ui/App.tsx` already implements renderer Save/Open, Undo/Redo, Quick Actions, desktop shortcuts, and transport playback.
- `docs/product/product.md`, `README.md`, and `docs/quality/rules.md` describe desktop behavior and QA boundaries.
- `harness/scripts/run_qa.py` enforces docs/code expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Add typed native menu command ids and Electron menu items for File, Edit, Transport, View, Window, and Help.
- [x] Expose a safe `onMenuCommand` preload bridge and consume it in `App.tsx`.
- [x] Route menu commands only to existing renderer handlers: Save, Open, Undo, Redo, Quick Actions, Play/Stop, and selected-event delete.
- [x] Update README, product docs, quality rules, and QA harness expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser/Electron smoke only if the environment allows launching the desktop app without policy blockers.

## Review Plan

QA completes before review starts. Review should verify that native menu commands are explicit, local, non-destructive, and routed through existing renderer paths without changing project data semantics or adding remote/sampling behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add native menu as a desktop shell feature. | Pro users expect app-level commands and shortcuts; beginners benefit from discoverable File/Edit/Transport menus without learning all in-canvas controls first. |
| 2026-06-17 | Keep menu handling renderer-owned. | The native menu sends only allowlisted command ids through preload IPC, while project mutation remains in existing renderer handlers. |
| 2026-06-17 | Keep native accelerators display-only for renderer-owned commands. | Existing renderer keydown handling already preserves focused-input guards, so Electron should not capture those shortcuts before the renderer can apply them. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created in `codex/plan-218-native-command-menu`. |
| 2026-06-17 | harness_builder | Added Electron native File/Edit/Transport/View/Window/Help menu commands and a typed preload command bridge. |
| 2026-06-17 | harness_builder | Routed menu commands to existing renderer Save/Open, Undo/Redo, Quick Actions, Play/Stop, and selected-event deletion handlers. |
| 2026-06-17 | harness_builder | Marked renderer-owned menu accelerators display-only so keyboard shortcuts continue through existing focused-input guards. |
| 2026-06-17 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`. |

## Completion Notes

Native Command Menu is implemented as a local desktop shell layer. It does not change project schema, save/open dialogs, undo/redo semantics, playback scheduling, render/export contents, or sampling boundaries. Electron GUI smoke was not run because this environment does not provide a policy-safe desktop launch path for interactive native menus; coverage is from typecheck, production build, static QA, and quality gate.
