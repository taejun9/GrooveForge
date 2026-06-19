# plan-477-command-reference-filter

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Make the dense read-only Command Reference easier to scan by adding a UI-local section filter for All, Desktop, Project, Create, Sound, Arrange, Mix, Finish, Deliver, and Beat Terms.

## Non-Goals

- Do not change Quick Actions, command execution, command ranking, Command Reference open/close routing, desktop shortcuts, Native Command Menu, Beat Terms content, project data, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not add command search inside Command Reference, command chains, macros, auto-run behavior, persistence, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not make Command Reference execute commands; it remains static/read-only guidance with a UI-local display filter.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Command Reference data and dialog rendering.
- `src/styles.css`: Command Reference layout and responsive styles.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect current Command Reference rendering, CSS, and static QA expectations.
- [x] Add UI-local section filter controls and filtered rendering without changing command execution.
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

QA completes before review starts. Review should confirm the filter is UI-local, non-persistent, read-only, covers every Command Reference section plus Beat Terms, and preserves project data, command execution, playback, save/load, export, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a section filter instead of more Command Reference rows. | Recent plans expanded coverage; the next usability gain is reducing scan load for beginners and faster stage lookup for producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make the dense read-only Command Reference easier to scan without changing command execution. |
| 2026-06-20 | repo_cartographer | Added a UI-local Command Reference section filter for All, Desktop, Project, Create, Sound, Arrange, Mix, Finish, Deliver, and Beat Terms. |
| 2026-06-20 | harness_builder | Updated README, product, quality, and harness expectations so the filter remains read-only and non-persistent. |
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

- Command Reference now has a section filter for All, Desktop, Project, Create, Sound, Arrange, Mix, Finish, Deliver, and Beat Terms.
- The filter only changes displayed rows inside the dialog, resets to All when the dialog closes, and does not persist to project data, localStorage, or any saved state.
- No Quick Actions, command execution, ranking, shortcuts, Native Command Menu, project data, undo/redo, playback, save/load, export, Handoff, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior was changed.

## Completion Notes

plan-477 completed by adding a UI-local Command Reference section filter and matching docs/harness guardrails. Browser verification was not possible because the managed sandbox blocked the local dev server and the escalated retry was rejected.
