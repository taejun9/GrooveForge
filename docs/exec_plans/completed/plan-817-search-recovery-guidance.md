# plan-817-search-recovery-guidance

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions no-match search states recoverable with UI-local guidance and explicit recovery controls so beginners can understand why no commands are shown and producers can quickly clear the query or switch to a useful scope without changing command search token behavior, ranking, filtered order, Spotlight Enter behavior, command execution, project data, playback, export, or sampling scope.

## Non-Goals

- Do not persist recovery state to project files, localStorage, analytics, cloud sync, or remote state.
- Do not change Quick Actions search matching, command ranking, filtered order, scope count derivation, Search Result behavior, Scope Filter Result behavior, Spotlight Enter behavior, Pinned Commands, Recent Commands, command execution semantics, desktop shortcut guards, Native Command Menu routing, project data, undo/redo, playback, save/load, render/export, Handoff, or sampling behavior.
- Do not add fuzzy search, synonyms, macros, command chains, automatic command execution, autoplay, auto-save, auto-export, imported audio, sampler devices, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns the Quick Actions search input, scope bar, no-match empty state, Spotlight readout, and command list rendering.
- `src/ui/App.tsx` owns Quick Actions query/scope state, filtered action derivation, and command run routing.
- `src/ui/workstationUiModel.ts` owns shared Quick Action search-adjacent result types.
- `README.md` and `docs/product/product.md` describe Quick Actions search, Search Result feedback, Scope Filters, and Spotlight.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin UI-local, non-mutating command discovery behavior and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-817-search-recovery-guidance` and `.worktree/plan-817-search-recovery-guidance` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Quick Actions no-match state, Search Result, Scope Filters, Spotlight, docs, and QA expectations.
- [x] Add UI-local no-match recovery guidance with explicit Clear Search and useful-scope switch controls without changing command execution or search semantics.
- [x] Update product/docs language and QA harness expectations for search recovery guidance.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that no-match search recovery is clearer while preserving UI-local query/scope state, search matching, scope counts, filtered order, Search Result behavior, Scope Filter behavior, Spotlight Enter behavior, current Quick Action definitions, explicit command execution, project data, playback, export, privacy, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve no-match Quick Actions search recovery instead of changing search behavior. | No-result command search is a beginner friction point and a producer speed bump; explicit UI-local recovery controls improve flow without altering ranking, matching, or command execution. |

## Progress Log

| date | role | note |
|---|---|
| 2026-06-26 | project_lead | Plan created after 816 completed plans to continue improving direct beat-workstation command discovery and execution clarity. |
| 2026-06-26 | harness_builder | Added UI-local no-match Quick Actions Search Recovery guidance with explicit Clear Search and best-scope switch controls derived from current query, scope, scope counts, and zero visible commands. |
| 2026-06-26 | repo_cartographer | Updated README, product notes, quality rules, and QA harness expectations for Search Recovery while preserving all-genre direct beat-workstation framing and secondary sampling scope. |

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

Post-QA review passed. Search Recovery guidance is UI-local and derived only from the current query, selected scope, scope counts, and zero visible commands. Clear Search and best-scope switch controls route through existing query/scope handlers and preserve search token behavior, filtered order, Search Result behavior, Scope Filter behavior, Spotlight Enter behavior, explicit command execution, Pinned Commands, Recent Commands, project data, playback, render/export, Handoff, privacy, and sampling boundaries.
