# plan-1425-delivery-actions-first

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make WAV, stem, MIDI, handoff-sheet, and delivery-bundle export actions the primary Delivery workflow while preserving route, receipt, manifest, format, and package proof in audience-aware helper surfaces.

## Non-Goals

- Removing any export format, delivery target, receipt, manifest, format analysis, package check, or Quick Action.
- Changing rendered audio, MIDI bytes, file naming, ZIP contents, project files, playback, or project schema.
- Redesigning Compose, Instrument, Arrangement, Mixer, or Master panels.
- Adding sampling, remote services, accounts, analytics, payments, uploads, or external distribution work.

## Context Map

- `src/ui/workstationAppHelpers.tsx`: Handoff Pack hierarchy, direct export actions, and proof surfaces.
- `src/ui/App.tsx`: audience-mode state, targeted reveal, and live desktop evidence hook.
- `src/styles.css`: direct delivery action and disclosure layout.
- `src/vite-env.d.ts`: typed live evidence contract.
- `electron/main.ts`: live desktop hierarchy and audience-mode assertions.
- `harness/scripts/run_renderer_smoke.mjs`: first-render hierarchy assertions.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live audience-mode and DOM assertions.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Preserve direct, event-based, sample-free, local-first composition and export.
- Preserve every existing Delivery action and test ID.
- Direct export remains explicit user action; no automatic file writes or uploads.

## Implementation Plan

- [x] Put an export role/readiness summary and the five direct export actions at the beginning of Handoff Pack.
- [x] Give first-time users concise format guidance without reducing professional export access.
- [x] Group route/receipt proof separately from format/package audit detail.
- [x] Keep proof helpers compact in Guided and expanded in Studio, with relevant actions revealing their result surface.
- [x] Extend renderer and live Electron hierarchy/mode evidence.
- [x] Run focused QA and a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `npm run delivery:bundle-zip-smoke`.
- Run `git diff --check`.

## Review Plan

Review starts after QA. It checks direct-export discoverability, format clarity, audience-mode defaults, hidden-result reveal, keyboard behavior, expert-proof preservation, responsive layout, receipt behavior, and exported-byte regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Lead Handoff Pack with explicit deliverable actions. | Both audiences should choose and create the artifact before inspecting supporting proof. |
| 2026-07-13 | Separate delivery status from proof and audit detail. | Current route, receipt, manifest, format, and package surfaces overwhelm the five file actions. |
| 2026-07-13 | Collapse proof helpers in Guided and expand them in Studio. | Beginners get a clear delivery choice while producers retain the complete handoff desk. |
| 2026-07-13 | Preserve Command Reference readiness criteria while allowing 30 seconds for its initial live IPC response. | Two feature runs and a freshly built main baseline all timed out at the prior 10-second IPC boundary under the current loaded GUI environment. |
| 2026-07-13 | Move Handoff Pack outside the optional Guide & Review Center. | Browser visual review proved that correct internal hierarchy was still clipped by the collapsed parent on the Guided first screen. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found five direct export buttons below route, receipt, manifest, format, and package proof surfaces. |
| 2026-07-13 | quality_runner | Live Electron retries and a freshly built main baseline reproduced the same pre-existing Command Reference initial-readiness timeout; the evidence criteria remain unchanged and only the IPC allowance was widened. |
| 2026-07-13 | review_judge | Browser visual review found Handoff Pack hidden inside the collapsed Guide & Review Center; moved it into the always-visible workstation flow and added ancestor-aware live visibility evidence. |
| 2026-07-13 | quality_runner | Final QA, typecheck, renderer, workflow, persona, build, live Electron visual/hierarchy/mode, native project I/O, delivery bundle ZIP, and diff checks passed. |
| 2026-07-13 | review_judge | Post-fix review found no remaining blockers; all five exports, existing proof surfaces, mode behavior, local-only boundaries, and prior test IDs remain intact. |

## Completion Notes

Handoff Pack now sits in the actual workstation flow outside the optional Guide & Review Center. Its route/readiness summary leads directly into five explicit deliverable actions: mix WAV, stem WAVs, arrangement MIDI, Handoff Sheet, and Delivery Bundle. Beginner-facing copy explains when each artifact is useful without hiding producer formats.

Delivery Status & Receipt contains the next send item and latest explicit export receipt. Format & Package Proof contains the manifest audit, format metrics, package checks, and planned filenames. Both are compact in Guided and expand in Studio through the shared mode handler. Export completion reveals status; format, manifest, and package focus actions reveal audit proof.

Browser visual review exposed that the first implementation was clipped by the collapsed Guide parent despite correct internal DOM order. The surface was moved outside that parent, and live Electron evidence now requires direct Delivery to be outside optional guidance and outside any closed details ancestor. The same review also reproduced a Command Reference initial IPC timeout on both feature builds and a freshly built main baseline; readiness criteria remain unchanged while the loaded-GUI response allowance is now 30 seconds.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, `npm run delivery:bundle-zip-smoke`, and `git diff --check` passed. The build retains the existing nonfatal frontend chunk-size warning. External distribution was not exercised or claimed.
