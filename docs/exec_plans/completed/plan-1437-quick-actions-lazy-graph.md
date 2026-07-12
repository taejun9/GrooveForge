# plan-1437-quick-actions-lazy-graph

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Remove the full Quick Actions command graph from first-screen module preloads while keeping the dialog immediately understandable, loading the complete command set on demand, and preserving every command, search, pin, recent, result, and launch-smoke route.

## Non-Goals

- Removing or reducing the Quick Actions command catalog.
- Raising the bundle warning limit or hiding the warning without changing loading behavior.
- Delaying direct toolbar, composition, playback, project, export, or keyboard controls.
- Changing command handlers, command IDs, project schema, audio, export, persistence, or sampling scope.

## Context Map

- `src/ui/workstationAppQuickActions.tsx`: statically needed Quick Actions results, parsing, metrics, and execution helpers.
- `src/ui/workstationAppQuickActionGraph.ts`: new on-demand full command graph factory.
- `src/ui/App.tsx`: lazy module lifecycle, session graph materialization, and error/retry state.
- `src/ui/workstationShellPanels.tsx`: immediate dialog loading/error presentation.
- `src/styles.css`: accessible loading/error surface.
- `vite.config.ts`: separate static helper and lazy graph chunk identities.
- `harness/scripts/run_quick_actions_bundle_smoke.mjs`: production HTML/chunk loading contract.
- `harness/scripts/run_renderer_smoke.mjs`: source and first-render lazy-load contract.
- `electron/main.ts` and `harness/scripts/run_desktop_launch_smoke.mjs`: complete live post-load command evidence.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- The initial production HTML must not module-preload the command graph chunk.
- Opening Actions or Command Reference handoff must display the dialog immediately and trigger one reusable module request.
- Launch smoke must wait for the graph rather than weakening its full command/search/run assertions.
- Loading failure must be visible, non-destructive, closable, and retryable.
- Preserve every existing Quick Action result helper, command ID, handler, pin/recent state, local-first behavior, and direct-composition invariant.

## Implementation Plan

- [x] Extract only `createQuickActions` and its graph-only imports into a dynamic module.
- [x] Keep result/search/execution helpers in the existing statically imported module.
- [x] Add one-shot on-demand loading, stable session factory reuse, explicit loading, error, and retry behavior.
- [x] Keep the dialog available during loading without presenting false zero-result/search recovery states.
- [x] Add production bundle evidence for a dynamic graph chunk absent from initial modulepreload and a sub-500 KB static helper chunk.
- [x] Extend renderer and live Electron evidence for loading transition and the unchanged full command graph.
- [x] Run focused and full QA, then a separate post-QA review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run harness:smoke`.
- Run `npm run build` and `npm run quick-actions:bundle-smoke`.
- Run `npm run desktop:launch-smoke` and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and compare existing Quick Action IDs, result helpers, and handler wiring.

## Review Plan

Review starts only after QA. It checks initial HTML preloads, dynamic chunk reachability, loading/error semantics, keyboard opening, Command Reference handoff, one-session graph reuse, exhaustive command evidence, and project/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Lazy-load only the 6,161-line `createQuickActions` command graph. | The full graph is needed only after Actions opens, while result/search/execution helpers are used throughout the workstation and must stay synchronous. |
| 2026-07-13 | Keep an immediate dialog shell with explicit loading and retry states. | Keyboard users need visible confirmation that Actions opened; an empty result list would incorrectly imply that no commands exist. |
| 2026-07-13 | Prove the production HTML contract instead of relying on source-level `import()` text. | Only built HTML and chunks prove that the graph is absent from initial modulepreload and remains loadable on demand. |
| 2026-07-13 | Let the dynamic import form its natural chunk instead of assigning the graph to a manual code-splitting group. | The manual group absorbed shared dependencies and caused the graph to re-enter the initial preload set; the natural boundary yields one reachable 169,386-byte on-demand chunk. |
| 2026-07-13 | Keep the graph's 24 small pure helper copies under AST parity evidence. | Importing the large static helper module from the graph would defeat the boundary, while exact source parity prevents silent behavior drift. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Production `dist/index.html` module-preloads the 504 KB Quick Actions chunk; static analysis isolated `createQuickActions` at lines 1255-7415 with 26 local helper dependencies. |
| 2026-07-13 | harness_builder | Added on-demand factory loading, immediate busy/error/retry UI, graph lifecycle markers, production preload evidence, and live Electron readiness evidence without changing the command factory body. |
| 2026-07-13 | quality_runner | Base QA, type, renderer, workflow, persona, harness, production build, bundle boundary, desktop launch, native project I/O, and whitespace validation passed. |
| 2026-07-13 | review_judge | Separate post-QA review proved byte-for-byte normalized factory parity, added AST parity checks for graph-local pure helpers, and found no remaining blocker. |

## Completion Notes

Quick Actions now keeps its complete command factory out of the initial production HTML preload set and loads it only when Actions is requested or exhaustive launch audit requires it. The first-render static helper chunk is 351,034 bytes and the reachable on-demand graph is 169,386 bytes, both below the 500 KB contract. The dialog opens immediately with accessible loading, non-destructive failure, close, Command Reference, and retry routes. The extracted `createQuickActions` TypeScript AST is identical to the pre-change factory, and live desktop evidence still exercises the complete command/search/run surface before reporting readiness.
