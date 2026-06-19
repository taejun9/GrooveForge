# plan-484-quick-actions-guide-suggestion

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add a UI-local Guide suggestion card inside Quick Actions so the current `guide-quick-start` target is visible immediately when the command palette opens, without changing command ordering, Spotlight Enter behavior, pins, recents, or project data.

## Non-Goals

- Do not change Quick Actions filtering, result ordering, Spotlight Enter target, Pinned Commands defaults, Recent Commands, command ranking, project schema, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not auto-run, auto-pin, persist, or chain the suggested command.
- Do not add onboarding overlays, tutorials, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Quick Actions dialog rendering and new suggestion card.
- `src/styles.css`: Quick Actions suggestion layout and responsive behavior.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect Quick Actions rendering, Spotlight, Pinned Commands, and Guide Quick Start command behavior.
- [x] Add a UI-local guide suggestion card that appears only when Quick Actions opens with no search query in All or Project scope.
- [x] Route the suggestion run button only through the existing `guide-quick-start` Quick Action definition and keep pins/recents/Spotlight behavior unchanged.
- [x] Update docs and harness expectations for the suggestion card.
- [x] Run QA, review, complete plan, and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm the suggestion is UI-local, runs only after explicit click through the existing `guide-quick-start` Quick Action, and does not change search/order/Spotlight/pinned/recent/project/export behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a separate suggestion card instead of default-pinning or moving the command list order. | This improves discoverability for beginners and speed for producers without violating Pinned Commands or command ranking invariants. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to surface Guide Quick Start in Quick Actions without changing command ordering, Spotlight Enter behavior, pins, or recents. |
| 2026-06-20 | repo_cartographer | Added a Quick Actions guide suggestion card for the current `guide-quick-start` command when search is empty in All or Project scope. |
| 2026-06-20 | harness_builder | Updated README, product, quality rules, and harness checks for the suggestion card and its UI-local constraints. |
| 2026-06-20 | quality_runner | Ran the required validation loop; all non-browser checks passed. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA and found no follow-up fixes. |

## QA Results

| command | result |
|---|---|
| `git diff --check` | passed |
| `python3 harness/scripts/run_qa.py` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run typecheck` | passed |
| `npm run build` | passed with existing Vite large chunk warning |
| `npm run qa` | passed |
| `npm run verify` | passed with existing Vite large chunk warning; runtime smoke passed 14/14 blueprints and 14/14 style profiles |
| `npm run dev -- --host 127.0.0.1` | blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy |

## Review

- No blocking findings.
- The Quick Actions guide suggestion is derived from current Quick Action definitions and appears only when search is empty in All or Project scope.
- The suggestion run button calls the existing `onRun(guideSuggestionAction)` path, so result handling, recents, and command execution stay centralized.
- The change does not alter Quick Actions filtering, result ordering, Spotlight Enter target, Pinned Commands defaults, Recent Commands, command ranking, project schema, undo/redo history, playback, save/load, render/export, Handoff, local draft, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior.

## Completion Notes

plan-484 completed by surfacing the current Guide Quick Start command inside Quick Actions as a UI-local suggestion card while preserving existing command palette semantics.
