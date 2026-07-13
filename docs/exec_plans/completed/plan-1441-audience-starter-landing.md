# plan-1441-audience-starter-landing

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Turn both first-run starter choices into complete action routes: after building the selected local project, land a first-time composer on the direct drum-composition surface and a professional producer on the open Review Queue instead of leaving either audience at the top of the page.

## Non-Goals

- Changing starter project musical data, genre/style rules, arrangement, mixer/master settings, or delivery targets.
- Auto-playing audio, auto-exporting, applying review fixes, or mutating project data beyond the explicit starter creation.
- Changing project schema, save/load, local draft format, undo/redo, Quick Actions ranking, or audience acceptance definitions.
- Adding onboarding modals, tours, accounts, analytics, remote AI, sampling, or imported audio.

## Context Map

- `src/ui/App.tsx`: first-run launchpad, `createAudienceStarter`, compose/master refs, Review Queue disclosure state, production launch-smoke collector.
- `src/ui/workstationAppHelpers.tsx`: Review Queue semantic section and focus target.
- `harness/scripts/run_renderer_smoke.mjs`: first-render/source route contracts.
- `electron/main.ts` and `harness/scripts/run_desktop_launch_smoke.mjs`: live first-run button, viewport landing, focus, and disclosure evidence.
- `docs/product/product.md`, `docs/architecture/product-architecture.md`, and `docs/quality/rules.md`: dual-audience first-session and compose-first contracts.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Beginner landing must expose the direct Pattern editor without requiring a second navigation action.
- Producer landing must open Review & Export plus Review Queue and expose that queue without applying a fix.
- Both targets must receive programmatic focus only after the explicit starter action and remain keyboard/screen-reader reachable.
- Existing visible buttons and Quick Actions must reuse the same starter-creation route.

## Implementation Plan

- [x] Add a shared post-starter landing route for beginner Compose and producer Review Queue targets.
- [x] Make both landing targets focusable and update launchpad copy to name the destination.
- [x] Add renderer source contracts plus production Electron viewport/focus/disclosure evidence for both routes.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run focused/full QA and desktop evidence, then perform a separate review.

## QA Plan

- Run `npm run renderer:smoke`, `npm run typecheck`, and `npm run qa`.
- Run `npm run harness:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run quick-actions:bundle-smoke`, `npm run desktop:launch-smoke`, and `npm run desktop:project-io-smoke`.
- Run `git diff --check`; inspect beginner and producer focus targets, viewport position, disclosure state, result feedback, and unchanged project data.

## Review Plan

Review starts only after QA. It checks direct action-to-workspace continuity for both audiences, keyboard focus semantics, Review Queue non-mutation, visible copy, production viewport evidence, and preservation of all project invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Route the beginner starter to the Pattern editor and the producer starter to an expanded Review Queue. | Live first-run testing showed starter creation collapses the choice card but leaves scroll position at the top; each audience needs an immediate, role-appropriate next action rather than another navigation decision. |
| 2026-07-13 | Resolve the shared landing on the next zero-delay event-loop turn, flushing producer disclosures there, and let production evidence wait the same turn before measurement. | Live review proved the Studio mode transition can reapply disclosure state after the starter handler, while hidden production Electron proved animation frames can pause; ordered zero-delay callbacks work for both visible and hidden renderers without duplicate navigation actions. |
| 2026-07-13 | Keep the exhaustive palette collector synchronous and measure starter landing in a separate 90-second Electron phase. | Waiting for deferred focus inside the already-large palette phase exhausted the global launch ceiling; a dedicated phase proves the actual user route without coupling its event-loop turn to unrelated command search and follow-up evidence. |
| 2026-07-13 | Let the dedicated landing phase settle one additional zero-delay turn and update Workflow Navigator jump evidence to require sticky-navigation clearance instead of y=0. | Hidden Electron can commit mode-aware disclosure effects one turn after the landing callback, and the prior y=0 contract directly contradicted the new non-overlap requirement. |
| 2026-07-13 | Share a measured sticky-navigation fallback between starter landing and Workflow Navigator jumps. | Browser CSS scroll margin worked, but production Electron showed nested Review Queue and Compose could still fall under the sticky surface; measuring the actual target/nav rectangles and correcting only a shortfall makes both routes deterministic across renderers. |
| 2026-07-13 | Give desktop workspace landing targets 148px of scroll margin and prove they clear the sticky Workflow Navigator. | Live browser review showed a nominally in-viewport Pattern editor could still have its heading and first row covered by the sticky navigation surface. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | quality_runner | Live in-app browser audit proved `Start an 8-bar beat` builds and collapses the launchpad but leaves `scrollY` at 0 with the Workflow Navigator below the 720px viewport, so direct composition remains off-screen. |
| 2026-07-13 | quality_runner | Live browser reruns proved beginner focus on `workflow-target-compose` with 12px sticky-nav clearance and producer focus on `review-queue` with both nested disclosures open and 16.875px clearance. |
| 2026-07-13 | harness_builder | Production Electron now measures starter landing in a dedicated bounded phase and reuses measured sticky-navigation correction for normal Workflow Navigator jumps. |
| 2026-07-13 | quality_runner | QA, typecheck, renderer, runtime, workflow, persona, build, lazy bundle, production Electron launch, native project I/O, and whitespace validation passed. |
| 2026-07-13 | review_judge | Separate post-QA review strengthened cross-renderer sticky-navigation correction and evidence isolation, then approved both audience landing routes with no remaining blocker. |

## Completion Notes

Both first-run starter buttons now finish the action they advertise. `Start an 8-bar beat` creates the guided project, collapses project choices, scrolls below the sticky Workflow Navigator, and focuses the direct Pattern editor; `Start a studio pass` creates the studio project, opens Review & Export plus Review Queue, scrolls below the sticky navigator, and focuses Review Queue. The same `createAudienceStarter` route serves visible and Quick Actions commands. Both target regions are programmatically focusable, normal Workflow Navigator jumps reuse measured sticky-nav clearance, and no route auto-plays, applies a fix, exports, or changes project data beyond explicit starter creation.
