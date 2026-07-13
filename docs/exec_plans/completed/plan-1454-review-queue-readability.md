# plan-1454-review-queue-readability

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Keep the Studio Review Queue readable wherever it is rendered. In the 1280×720 production layout, the current issue, its evidence, the next check, the available fix, and the follow-up audition must retain visible text width instead of collapsing to zero or disappearing behind one-line ellipses. Wide layouts should retain their efficient horizontal scan while the narrow master sidebar should adopt a compact, readable local layout without changing review decisions or fix behavior.

## Evidence and Motivation

A live 1280×720 Studio-route audit found the Review Queue at 259px wide with 337px of internal scroll width. The priority label, evidence, and next-check fields each computed to 0px while the action kept 92px; the fix-preview follow-up fields also computed to 0px and began at x=1316 outside the 1280px viewport. The focused issue label showed only 68px of a 193px string and its evidence showed 87px of 301px. The Queue therefore displayed an action without enough visible context to decide whether the action was appropriate.

## Non-Goals

- Changing review analysis, priority ordering, tone, metrics, fix selection, or project mutations.
- Removing Review Queue fields, shortening their domain content, or replacing them with hover-only information.
- Changing Guided/Studio mode routing, starter project generation, project schema, undo history, playback, render/export, persistence, privacy, or sampling scope.
- Redesigning the overall workstation grid, workflow navigator, persistent command dock, or master sidebar width.

## Constraints

- QA completes before a separate review starts.
- Responsive behavior must follow the Queue's own inline size rather than only the viewport width because the Queue is narrow inside a wide desktop sidebar.
- At 1280×720, every current priority and fix-preview text field must have positive rendered width, stay within the Queue, and remain visibly readable without hover.
- Narrow Queue content may wrap and grow vertically; the page must retain zero horizontal document overflow and the Queue must stay within its master panel.
- Wide Queue layouts must retain the existing horizontal scan contract.
- Review actions and fixes must preserve project, undo, playback, focus, and analysis behavior.

## Implementation Plan

- [x] Add a Review Queue inline-size container and compact local layout for narrow instances.
- [x] Preserve full text through wrapping in the narrow focus, priority, preview, result, and issue rows.
- [x] Add renderer and production Electron evidence for wide and narrow Queue posture.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make narrow Review Queue readability the next completion target. | Studio correctly routes professionals to the highest-priority issue, but at the supported 1280px desktop width the issue context collapses before the action, defeating the route for both experts and learners. |
| 2026-07-14 | Use a component container query instead of another viewport breakpoint. | The Queue is 259px inside a 1280px viewport; its actual inline size, not the page width, determines whether its five-column diagnostic rows can render. |
| 2026-07-14 | Allow narrow Queue rows to grow vertically while preserving the wide scan layout as the default. | Visible decision context is more important than fixed card height in the sidebar, while genuinely wide Queue instances still benefit from compact horizontal comparison. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-14 | repo_cartographer | Browser audit entered the real Studio starter route and found a 259px Review Queue with 337px internal scroll width, three 0px priority fields, two 0px fix-follow-up fields, and no document-level horizontal overflow because the missing content was clipped inside the panel. |
| 2026-07-14 | harness_builder | Added a named inline-size container and compact stacked rules that wrap focus, priority, preview, result, fix-result, and issue content without changing their data or actions. Renderer smoke locks the component-local contract. |
| 2026-07-14 | quality_runner | Browser re-audit at 1280×720 measured all 11 decision fields at 198–219px, Queue internal overflow at 0px, document overflow at 0px, and all three diagnostic rows as one column. At a 3400px viewport, the same Queue retained its 3/5/3-column focus, priority, and preview scan layout with zero internal overflow. |
| 2026-07-14 | quality_runner | Standalone production Electron launch smoke passed with 11/11 wrapped and contained Queue fields across three compact rows, plus all existing starter, layout, keyboard, disclosure, project-state, and visual evidence. |
| 2026-07-14 | quality_runner | Full `npm run verify` passed source, packaged app, ad-hoc signature, PKG payload, simulated install, project I/O, delivery, persona, and release-evidence paths; only the existing external signing, notarization, and private distribution proof remains unavailable locally. |
| 2026-07-14 | review_judge | Separate post-QA review approved the change with no blocking, major, or moderate findings. |
