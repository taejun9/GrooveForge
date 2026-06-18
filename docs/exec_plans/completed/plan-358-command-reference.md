# plan-358-command-reference

## Status

complete

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working producers while staying approachable for beginners.

## Goal

Add an in-app local Command Reference for desktop shortcuts, Quick Actions, Keyboard Capture, and first-beat workflow commands so beginners can discover the main controls and producers can scan fast-operation paths without leaving the workstation.

## Non-Goals

- Do not change project schema, saved project data, localStorage, undo/redo history, playback scheduling, Web MIDI input, audio rendering, WAV/stem/MIDI export, Handoff behavior, or Quick Actions command execution semantics.
- Do not add global OS shortcuts, background automation, command chains, onboarding overlays, tutorials, accounts, analytics, remote AI, cloud sync, sampling, imported audio, sampler devices, or audio clips.
- Do not replace Quick Actions, Keyboard Capture, or Native Command Menu behavior.

## Context Map

- `src/ui/App.tsx`
- `src/ui/workstationShellPanels.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `electron/main.ts`
- `electron/preload.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Keep the reference UI-local and session-only.
- Route Help menu and shortcut buttons through an allowlisted renderer command.
- Keep shortcuts guarded outside focused inputs.
- QA and review are separate loops.

## Implementation Plan

- [x] Add a reusable Command Reference surface listing the key local command groups and shortcut labels.
- [x] Add a header button, `?` desktop shortcut, Quick Actions command, and native Help menu item that open the same reference without mutating project data.
- [x] Update product docs, quality rules, and harness expectations for command-reference behavior.
- [x] Run QA, typecheck, build, verify, and diff checks.
- [x] Complete plan and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify that the Command Reference is UI-local, discoverable from Help/menu/shortcut/Quick Actions/header paths, preserves existing shortcut input guards and command semantics, does not mutate project data or history, and avoids sampling or remote/cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add a local command reference instead of another editing macro. | The workstation has many explicit controls; discoverability is now a practical desktop-app completion gap for beginners and fast producer use. |
| 2026-06-18 | Keep the reference read-only and reuse existing command paths only for opening/closing it. | The feature should teach and orient without changing project state, playback, exports, or command behavior. |
| 2026-06-18 | Treat browser visual verification as unavailable for this plan. | The Vite dev server could not bind inside the sandbox (`listen EPERM`), and escalation for the local dev server was rejected; QA was completed with static source checks, typecheck, build, and harness verification. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-358-command-reference`. |
| 2026-06-18 | harness_builder | Added Command Reference dialog, header button, `?`/`CmdOrCtrl+/` shortcut, Quick Actions command, and Electron Help menu route. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and QA harness expectations for the UI-local read-only reference. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`; final compact rerun passed QA, quality gate, typecheck, and diff check. |
| 2026-06-18 | review_judge | Reviewed diff after QA; no code findings. Browser visual check remains a noted residual limitation because local dev server startup was blocked by sandbox policy. |
