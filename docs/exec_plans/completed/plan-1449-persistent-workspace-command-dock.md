# plan-1449-persistent-workspace-command-dock

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Keep the essential session commands reachable while users work deep in the editor. After the full transport header leaves the viewport, show a compact fixed workspace command dock with current transport posture plus Play/Stop, Quick Actions, Undo, Redo, and Save controls that reuse the existing handlers.

## Non-Goals

- Changing playback, undo/redo, save, Quick Actions, project schema, musical events, generation, export, or audio-engine behavior.
- Making the first-run header taller or adding another always-visible onboarding surface.
- Adding remote services, analytics, accounts, private values, audio import, or sampling-first behavior.

## Constraints

- QA completes before a separate review starts.
- The dock stays absent while any part of the full transport header is visible and appears only after that header leaves the viewport.
- The dock is keyboard reachable, uses explicit labels and shortcut metadata, preserves disabled Undo/Redo states, and exposes live transport posture without becoming a second state owner.
- Dock actions call the same Play/Stop, Quick Actions, Undo, Redo, and Save handlers as the full transport.
- The dock must remain inside the desktop viewport at the actual minimum application width, introduce no horizontal document overflow, and avoid covering focused workspace controls.
- Native Electron evidence must prove show/hide posture, viewport containment, focusability, action reuse, and return to the full header.

## Implementation Plan

- [x] Derive dock visibility from the full transport header's viewport intersection.
- [x] Add the compact fixed dock and responsive, focus-visible styling.
- [x] Add renderer and native Electron evidence for visibility, containment, and shared actions.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Use one fixed, conditional workspace dock instead of making the full header or medium-width Workflow Navigator sticky. | The full header is too large to pin, while the medium-width navigator can occupy several rows; a compact conditional dock keeps essential commands reachable without consuming the initial composition viewport. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | repo_cartographer | Live 1280x720 and 1024x720 inspection confirmed that Play, Actions, Undo, Redo, and Save leave the viewport during editor work; at 1024px the non-sticky Workflow Navigator also leaves the viewport. |
| 2026-07-13 | harness_builder | Renderer coverage now locks conditional observer ownership, five shared handlers, shortcut/disabled metadata, fixed viewport bounds, initial absence, and focus/scroll clearance. |
| 2026-07-13 | quality_runner | Live 1180x720 browser evidence passed initial absence, editor show posture, 660x64 viewport containment, zero horizontal overflow, shared Play/Stop state, Quick Actions opening, Escape focus restoration, and return-to-header hiding. |
| 2026-07-13 | quality_runner | Electron's synthetic Enter did not activate a focused ordinary button, so native evidence uses real mouseDown/mouseUp for dock actions and keeps explicit programmatic focus plus native Escape restoration checks. |
| 2026-07-13 | quality_runner | Full production Electron launch smoke passed conditional show/hide and return, five controls, keyboard focusability, native Play/Stop and Actions, Escape focus restoration, transport/Undo/Redo parity, viewport containment, the 1180px zero-overflow minimum-window gate, Command Reference, and final visual evidence. |
| 2026-07-13 | harness_builder | Kept the dock/modal collector bounded at 280 seconds and raised the complete app/parent launch bounds to 520/540 seconds so the unchanged Command Reference and visual collectors return structured evidence after the new native dock pass. |
| 2026-07-13 | quality_runner | Full `npm run verify` passed with exit code 0, including quality gate, typecheck/build, renderer/workflow/persona/runtime smokes, native Electron launch and project IO, app/DMG/PKG assembly, payload and isolated-install launch/project IO, privacy-safe release evidence, and the explicit external-distribution boundary. |
| 2026-07-13 | review_judge | Separate post-QA review found no blocking, important, or follow-up findings. Observer cleanup, shared command ownership, modal focus restoration, responsive viewport bounds, bottom focus clearance, native evidence, timeout bounds, project/privacy invariants, and documentation agree. |
| 2026-07-13 | plan_keeper | Plan completed and moved to `docs/exec_plans/completed/`; completion review mirror created in `docs/reviews/`. |
