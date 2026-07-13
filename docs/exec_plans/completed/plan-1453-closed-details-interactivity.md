# plan-1453-closed-details-interactivity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Restore truthful disclosure behavior across the workstation. A closed `<details>` panel must hide its non-summary content visually, remove every descendant control from keyboard navigation and pointer interaction, and keep only its summary toggle reachable. Reopening the same panel must restore its existing content and controls without changing project data, playback, undo history, selection, or feature behavior.

## Evidence and Motivation

A live 1280×720 browser audit on `main` found 662 reachable controls. Twenty closed disclosure panels still rendered direct-child content because author `display` rules overrode the browser's native closed-details presentation. Those closed panels leaked 558 Tab stops: Guide & Review Center 255, Pattern Lab 54, Arrangement Tools 47, Capture & Ideas 35, Sound Design 23, Review & Export 20, Harmony Moves 16, Format & Package Proof 11, four mixer Tone & Space panels 40, Mix Moves 10, Audition & Compare 10, Polish & Automation 10, Block Moves 8, Mix Coach 8, Exports 5, Review Queue 5, and Session Context 1.

## Non-Goals

- Changing which disclosure panels start open, or changing their summaries, labels, contents, or feature behavior.
- Removing guidance, producer tools, diagnostics, sound controls, arrangement tools, exports, or handoff checks.
- Changing project schema, playback, generation, undo history, render/export logic, local persistence, sampling scope, remote behavior, or private data handling.
- Redesigning individual cards or changing Guided/Studio mode disclosure policy.

## Constraints

- QA completes before a separate review starts.
- The fix must apply to every native `<details>` disclosure, including nested panels and panels whose content uses `display: grid`, `flex`, or other author layout rules.
- Closed panels expose exactly their summary in the Tab order and no descendant content geometry or pointer target.
- Open panels retain their existing layout and interactive descendants.
- Toggling disclosure state is UI-only and must not mutate musical events, arrangement, mixer/master state, playback, or undo history.
- Renderer evidence must enumerate every closed `<details>` in the server-rendered workstation and reject visible/reachable descendant content contracts that can override native closed behavior.
- Production browser and Electron evidence must cover the high-density Guide & Review Center plus representative nested/editor disclosures.

## Implementation Plan

- [x] Add a global closed-details containment rule that wins over direct-child layout declarations.
- [x] Add renderer evidence for the containment contract and current disclosure inventory.
- [x] Add representative production Electron evidence for closed and reopened disclosure behavior.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make closed disclosure containment the next completion target. | The live DOM exposed 558 controls inside 20 panels whose summaries claimed they were closed; this overwhelms first-time users and makes keyboard navigation inefficient for professionals. |
| 2026-07-14 | Fix the shared native disclosure contract rather than patching individual panels. | The same author-layout override affects guidance, composition, arrangement, mix, master, export, and nested diagnostic panels. A shared rule prevents recurrence and preserves each panel's existing open-state layout. |
| 2026-07-14 | Keep disclosure keyboard activation ahead of the global Space transport shortcut. | Native Enter was not reliable in the production shell and focused-summary Space otherwise reached transport playback; one click-equivalent path preserves native and React toggle ownership without duplicate activation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-14 | repo_cartographer | Live 1280×720 audit found 662 reachable controls and 558 leaked Tab stops across 20 closed disclosure panels; Guide & Review Center alone leaked 255 controls while reporting `Guided · On demand`. |
| 2026-07-14 | harness_builder | Added one global closed-details containment rule and removed two component-only exceptions. Renderer smoke now inventories all 24 native disclosures, locks the one-open/23-closed first-render posture, and verifies the shared rule wins over component display declarations. |
| 2026-07-14 | quality_runner | Browser re-audit at 1280×720 found 24 disclosures, one open, 23 closed, zero visible closed content children, zero reachable closed controls, and zero horizontal overflow. The Browser skill exposed both the 558-stop leak and the global Space shortcut conflict on summaries. |
| 2026-07-14 | harness_builder | Focused summaries now consume unmodified Enter/Space through one click-equivalent activation before global Space playback, keeping native disclosure state and existing React `onToggle` state synchronized. |
| 2026-07-14 | quality_runner | Production Electron launch smoke passed with zero closed content/Tab leaks across 24 panels, native Enter open/reclose for Guide & Review Center, Pattern Lab, and mixer Tone & Space, unchanged project/undo posture, stopped playback, and all existing layout, modal, keyboard-editor, starter, and visual evidence. |
| 2026-07-14 | quality_runner | Full `npm run verify` passed source launch, packaged app, ad-hoc signed app, PKG payload, and simulated install paths plus project I/O, delivery, and release evidence; only the existing external signing, notarization, and private distribution proof remains unavailable locally. |
| 2026-07-14 | review_judge | Separate post-QA review approved the change with no blocking, major, or moderate findings. |
