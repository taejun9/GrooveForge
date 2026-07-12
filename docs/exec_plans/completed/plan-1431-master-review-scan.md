# plan-1431-master-review-scan

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Keep final readiness and export posture immediately visible while making the long Review Queue and Mix Coach surfaces separately scannable and available on demand.

## Non-Goals

- Removing Finish Checklist, Review Queue, Export Meter, Mix Coach, fixes, focus actions, or result feedback.
- Changing readiness scoring, mix/master data, playback, rendering, exports, project files, or delivery rules.
- Adding remote mastering, analytics, accounts, imported audio, or sampling workflows.

## Context Map

- `src/ui/App.tsx`: disclosure state, focus routes, and Master Review composition.
- `src/styles.css`: nested review disclosure and responsive layout.
- `src/vite-env.d.ts`: typed live interaction evidence.
- `electron/main.ts`: initial hierarchy and nested visibility evidence.
- `harness/scripts/run_renderer_smoke.mjs`: first-render scan contract.
- `harness/scripts/run_desktop_launch_smoke.mjs`: live collapsed/reveal/reset evidence.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Finish Checklist and Export Meter remain directly visible whenever Review & Export is open.
- Review Queue and Mix Coach keep visible summaries when their details are closed.
- Existing focus and Quick Actions routes must reveal the destination before showing result feedback.
- Preserve every current test ID, handler, local-first boundary, and sample-free event model.

## Implementation Plan

- [x] Add controlled Review Queue and Mix Coach disclosures inside Review & Export.
- [x] Keep Finish Checklist and Export Meter outside those nested disclosures.
- [x] Reveal the relevant disclosure from focus/fix/Quick Actions routes.
- [x] Extend renderer and live Electron evidence for default compactness, manual reveal, routed reveal, and reset.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and compare prior Review Queue/Mix Coach test IDs.

## Review Plan

Review starts after QA. It checks critical readiness visibility, disclosure summaries, keyboard semantics, focus-route reveal, Studio scan speed, Guided compactness, action/result preservation, and mix/master/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Keep Finish Checklist and Export Meter direct while nesting Review Queue and Mix Coach. | Readiness and export posture are the final-stage essentials; long diagnostic/fix lists are valuable but secondary until a user chooses them. |
| 2026-07-13 | Start both nested diagnostic disclosures closed in every mode. | Studio already opens the outer Review & Export surface; compact inner summaries preserve professional awareness without rendering both long diagnostic lists at once. |
| 2026-07-13 | Reset inner diagnostics when Guided/Studio mode changes, but preserve manual choices while only the outer disclosure is toggled. | Mode changes establish a predictable compact baseline; ordinary inspection should not discard a user's local open/closed choice. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Audit confirmed Studio opens Finish Checklist, Review Queue, Export Meter, and Mix Coach as one continuous column; plan-1424 identified Review Queue and Mix Coach as the remaining scan-density risk. |
| 2026-07-13 | harness_builder | Renderer and Electron evidence prove direct essential ordering, nested default compactness, Studio compactness, route-driven reveal, and Guided reset. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer/workflow/persona smokes, production build, native project I/O, live Electron launch smoke, and diff checks passed. |
| 2026-07-13 | review_judge | Post-QA review approved the nested diagnostics with no blocking findings and confirmed prior result/fix test IDs remain intact. |

## Completion Notes

- Finish Checklist and Export Meter remain directly visible whenever Review & Export is open.
- Review Queue and Mix Coach show compact status summaries and expand independently.
- Review Queue focus/fix routes reveal Review Queue; Mix Coach focus/fix routes reveal Mix Coach.
- Studio opens the outer Master helpers while keeping both long diagnostics compact; mode reset returns the same baseline.
- Review: `docs/reviews/plan-1431-master-review-scan-review.md`.
