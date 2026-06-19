# plan-478-command-reference-search

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Make the read-only Command Reference faster to use by adding UI-local text search that filters visible command rows and Beat Terms by command, shortcut, target, section, term, meaning, or target label.

## Non-Goals

- Do not change Quick Actions search, command execution, command ranking, Command Reference open/close routing, section filter semantics, desktop shortcuts, Native Command Menu, Beat Terms content, project data, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not add command execution from Command Reference, command chains, macros, auto-run behavior, persistence, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not persist the Command Reference search query; it remains UI-local display state and resets with the dialog.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Command Reference data, filter state, and dialog rendering.
- `src/styles.css`: Command Reference layout and responsive styles.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect current Command Reference filter rendering, CSS, and static QA expectations.
- [x] Add UI-local search input and filtered rendering across commands and Beat Terms.
- [x] Update docs and harness expectations.
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

QA completes before review starts. Review should confirm search is UI-local, non-persistent, read-only, works with the existing section filter, covers command rows and Beat Terms, and preserves project data, command execution, playback, save/load, export, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add Command Reference text search after section filtering. | Section filtering reduces stage-level scan load; text search helps users find specific production concepts such as 808, chord, export, or handoff without changing command behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make the read-only Command Reference searchable without command execution or persistence. |
| 2026-06-20 | repo_cartographer | Added UI-local Command Reference search across command rows and Beat Terms while preserving the existing section filter. |
| 2026-06-20 | harness_builder | Updated README, product, quality, and harness expectations so search remains read-only and non-persistent. |
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
| `npm run verify` | passed with existing Vite large chunk warning |
| `npm run dev -- --host 127.0.0.1` | blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy |

## Review

- Command Reference now has UI-local text search that filters visible command rows by section, command, shortcut, and target text, and filters Beat Terms by term, meaning, and target text.
- Search works with the existing section filter, shows the current visible result count, and displays a local empty state when there are no matches.
- Search resets with the dialog and does not persist to project data, localStorage, or any saved state.
- No Quick Actions search, command execution, ranking, shortcuts, Native Command Menu, project data, undo/redo, playback, save/load, export, Handoff, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior was changed.

## Completion Notes

plan-478 completed by adding UI-local Command Reference search and matching docs/harness guardrails. Browser verification was not possible because the managed sandbox blocked the local dev server and the escalated retry was rejected.
