# plan-819-search-hint-chips

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions easier to search from an empty query by adding UI-local Search Hint chips derived from the current scope and existing command definitions so beginners can discover useful search terms and working producers can fill a command query quickly without changing command search token behavior, ranking, filtered order, Spotlight Enter behavior, command execution, project data, playback, export, or sampling scope.

## Non-Goals

- Do not persist hint state to project files, localStorage, analytics, cloud sync, or remote state.
- Do not change Quick Actions search matching, command ranking, filtered order, scope count derivation, Search Result behavior, Scope Filter Result behavior, Search Recovery guidance, Search Recovery Result behavior, Spotlight Enter behavior, Pinned Commands, Recent Commands, command execution semantics, desktop shortcut guards, Native Command Menu routing, project data, undo/redo, playback, save/load, render/export, Handoff, or sampling behavior.
- Do not add fuzzy search, synonyms, macros, command chains, automatic command execution, autoplay, auto-save, auto-export, imported audio, sampler devices, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns the Quick Actions search input, scope bar, no-match recovery, result strips, Spotlight, and command list rendering.
- `src/ui/App.tsx` owns Quick Actions query/scope state, filtered action derivation, and command run routing.
- `src/ui/workstationUiModel.ts` owns shared Quick Action result and scope types.
- `README.md` and `docs/product/product.md` describe Quick Actions search, Search Result, Search Recovery, and Scope Filters.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin UI-local, non-mutating command discovery behavior and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-819-search-hint-chips` and `.worktree/plan-819-search-hint-chips` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Quick Actions search input, scope derivation, docs, and QA expectations.
- [x] Add UI-local Search Hint chips for empty-query command discovery without changing search/filter/ranking/Enter/command execution behavior.
- [x] Update product/docs language and QA harness expectations for search hint chips.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Search Hint chips improve command discovery while preserving UI-local query state, search matching, scope counts, filtered order, Search Result behavior, Search Recovery behavior, Spotlight Enter behavior, current Quick Action definitions, explicit command execution, project data, playback, export, privacy, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Add query-fill Search Hint chips instead of changing search matching. | Empty command search still requires users to know terms; explicit chips help beginners and speed up producers without altering command discovery semantics. |

## Progress Log

| date | role | note |
|---|---|
| 2026-06-26 | project_lead | Plan created after 818 completed plans to continue improving direct beat-workstation command discovery and execution clarity. |
| 2026-06-26 | harness_builder | Added UI-local Quick Actions Search Hint chips for empty-query command discovery, deriving scope-aware query suggestions from existing command definitions and routing clicks only through the existing query-change handler. |
| 2026-06-26 | repo_cartographer | Updated README, product notes, quality rules, and QA harness expectations for Search Hint chips while preserving all-genre direct beat-workstation framing and secondary sampling scope. |

## QA Log

| command | result |
|---|---|
| `git diff --check` | Passed. |
| `python3 harness/scripts/run_qa.py` | Passed. |
| `npm run typecheck` | Passed. |
| `python3 harness/scripts/run_quality_gate.py` | Passed. |
| `npm run build` | Passed with existing Vite chunk-size warning. |
| `npm run qa` | Passed. |
| `npm run verify` | Passed with quality gate, runtime smoke, typecheck, build, and existing Vite chunk-size warning. |

## Review Log

Post-QA review passed. Search Hint chips are UI-local and derived only from an empty query, selected scope, fixed scope-aware hint terms, and existing Quick Action command definitions. Hint clicks route through the existing query-change handler and preserve search token behavior, filtered order, Search Result behavior, Scope Filter behavior, Search Recovery guidance, Search Recovery Result behavior, Spotlight Enter behavior, explicit command execution, Pinned Commands, Recent Commands, project data, playback, render/export, Handoff, privacy, and sampling boundaries.
