# plan-1424-master-output-first

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make final output preset and limiter ceiling the primary Master workflow while preserving polish generators, automation, mix review, finish checks, and export analysis in audience-aware helper surfaces.

## Non-Goals

- Removing master presets, ceiling control, finish pads, automation pads, checklists, review queue, export meter, Mix Coach, or fixes.
- Changing master DSP, automation data, playback, rendering, exports, project files, or style profiles.
- Redesigning Compose, Instrument, Arrangement, Mixer, or Delivery panels.
- Adding sampling, remote services, accounts, analytics, payments, or external distribution work.

## Context Map

- `src/ui/App.tsx`: Master hierarchy, output controls, helper state, and actions.
- `src/styles.css`: Master and disclosure layout.
- `electron/main.ts`: live desktop hierarchy evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render hierarchy assertions.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live audience-mode and DOM assertions.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Preserve direct, event-based, sample-free, local-first composition.
- Preserve every existing Master control, test ID, and keyboard disclosure behavior.

## Implementation Plan

- [x] Put master preset and ceiling controls immediately after the output role readout.
- [x] Add a precise numeric ceiling input alongside the range control with beginner-facing headroom guidance.
- [x] Group finish/automation generators separately from review/export analysis.
- [x] Keep helper surfaces compact in Guided and expanded in Studio, with targeted actions revealing results.
- [x] Extend renderer and live Electron hierarchy/mode evidence.
- [x] Run focused QA and a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check`.

## Review Plan

Review starts after QA. It checks output-control discoverability, ceiling precision and bounds, audience-mode defaults, hidden-result reveal, keyboard behavior, expert-tool preservation, responsive layout, and master/render/export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Lead Master with preset and limiter ceiling. | Both audiences must understand the final output posture before requesting fixes or reading analysis. |
| 2026-07-13 | Separate Polish & Automation from Review & Export. | Creative finalization and validation are distinct stages and should not compete with the direct output controls. |
| 2026-07-13 | Collapse helpers in Guided and expand them in Studio. | Beginners get a clear finish surface while working producers retain the complete review desk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit found seven finish/review/analysis surfaces before the actual ceiling and preset controls. |
| 2026-07-13 | harness_builder | Reordered output controls, added bounded numeric ceiling input and helper disclosures, wired targeted reveal, and extended renderer/live Electron evidence. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer, workflow, persona, build, live Electron hierarchy/bounds/mode/visual, and native project I/O checks passed. |
| 2026-07-13 | review_judge | Separate post-QA review caught and fixed transient numeric ceiling editing; all prior Master controls remain present and direct output now leads both helper surfaces. |

## Completion Notes

Master now begins with the current output posture, limiter ceiling, and output preset. The ceiling has both a range control and precise numeric draft input, clamps to -6.0 through 0.0 dB in 0.1 dB steps, permits transient empty/negative editing, and commits on blur or Enter. Beginner copy explains that lower values preserve more export headroom.

Finish presets and automation follow in Polish & Automation. Finish Checklist, Review Queue, Export Meter, Mix Coach, and fixes follow in Review & Export. Guided keeps both helpers compact; Studio expands them through the shared mode-aware handler. Related apply/focus/fix actions reveal the appropriate surface, and no prior Master test-ID surface was removed.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, and `git diff --check` passed. The build retains the existing nonfatal frontend chunk-size warning. External distribution was not exercised or claimed.
