# plan-1423-mixer-strips-first

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make direct channel balance the primary Mixer workflow while keeping channel processing, mix generators, send effects, stem audition analysis, and A/B snapshots immediately available through audience-aware surfaces.

## Non-Goals

- Removing mute, solo, volume, pan, EQ, drive, glue, send, meters, balance pads, Space FX, stem audition, or snapshots.
- Changing mixer data, DSP, playback, rendering, exports, project files, or style profiles.
- Redesigning Compose, Instrument, Arrangement, Master, or Delivery panels.
- Adding sampling, remote services, accounts, analytics, payments, or external distribution work.

## Context Map

- `src/ui/App.tsx`: Mixer hierarchy, channel strips, state, and action handlers.
- `src/styles.css`: strip and disclosure layout.
- `electron/main.ts`: live desktop hierarchy evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render hierarchy assertions.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live audience-mode and DOM assertions.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Preserve direct, event-based, sample-free, local-first composition.
- Preserve every existing Mixer control, test ID, and keyboard disclosure behavior.

## Implementation Plan

- [x] Put channel strips immediately after the Mixer title.
- [x] Keep mute, solo, volume, pan, level role, and meters in the direct strip path.
- [x] Group per-channel tone/dynamics/send controls into Channel Processing disclosures.
- [x] Group balance/send generators and audition/snapshot analysis into separate disclosures after the strips.
- [x] Keep advanced surfaces compact in Guided and expanded in Studio, with targeted actions revealing results.
- [x] Extend renderer and live Electron hierarchy/mode evidence.
- [x] Run focused QA and a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check`.

## Review Plan

Review starts after QA. It checks direct balance discoverability, per-channel processing access, audience-mode defaults, hidden-result reveal, keyboard behavior, expert-control preservation, responsive layout, and mixer/playback/export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Lead Mixer with channel strips and basic balance. | Both audiences need mute, solo, level, pan, and meters before presets or analysis. |
| 2026-07-13 | Separate Mix Moves from Audition & Compare. | Applying a balance/send move and checking stems/snapshots are distinct producer tasks. |
| 2026-07-13 | Collapse channel processing and helper disclosures in Guided, expand them in Studio. | Beginners see a readable console while professionals retain the full desk without extra setup. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found four generator/analysis surfaces before channel strips and five processing controls exposed in every non-master strip. |
| 2026-07-13 | harness_builder | Reordered channel strips, added Processing/Mix Moves/Audition disclosures, wired targeted reveal, and extended renderer/live Electron evidence. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer, workflow, persona, build, live Electron hierarchy/mode/visual, and native project I/O checks passed. |
| 2026-07-13 | review_judge | Separate post-QA diff review found no blocker; all prior Mixer controls remain present, direct balance leads, and beginner-facing processing copy was clarified to Tone & Space. |

## Completion Notes

Mixer now begins with five channel strips. Mute, solo, role posture, volume, pan, stem level, and compact readout remain in the direct path. Each non-master channel exposes low cut, air, drive, glue, and Space send afterward through a concise Tone & Space disclosure. Mix Balance and Space FX follow the console in Mix Moves; stem isolation, listening decisions, and Mix Snapshot A/B follow in Audition & Compare.

Guided mode keeps all three advanced surfaces compact. Studio mode expands channel processing, Mix Moves, and Audition & Compare through the shared mode-aware handler. Related Quick Actions and apply/capture/recall actions open the relevant helper surface, and no prior Mixer test-ID surface was removed.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `git diff --check` passed. The build retains the existing nonfatal frontend chunk-size warning. External distribution was not exercised or claimed.
