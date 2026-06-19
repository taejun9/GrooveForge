# plan-480-guide-command-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily, and report progress every 10 plans.

## Goal

Add a Guide lane to Command Reference so first-time beat makers and working producers can find the direct beat-making guidance surfaces from the same read-only reference map, then provide the requested 10-plan progress report after completion.

## Non-Goals

- Do not change Quick Actions search, command execution, command ranking, Command Reference open/close routing, text-search semantics, desktop shortcuts, Native Command Menu, project data, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not execute commands from Command Reference, persist Command Reference filter/search state, add command chains, macros, auto-run behavior, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not make sampling a primary section, first-run route, or MVP path.

## Context Map

- `src/ui/workstationShellPanels.tsx`: Command Reference section data, filter ids, filter buttons, and dialog rendering.
- `src/ui/App.tsx`: Quick Actions Command Reference detail and result metric labels.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Command Reference section/filter implementation and static QA expectations.
- [x] Add a Guide Command Reference section/filter for direct beat-making guidance surfaces.
- [x] Update Quick Actions labels plus docs/harness expectations for the new Guide lane.
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

QA completes before review starts. Review should confirm the Guide lane is UI-local and read-only, lists direct beat-making guidance surfaces ahead of creative/action lanes, does not execute commands, preserves project data, playback, save/load, export, Handoff, and sampling boundaries, and supports the requested 10-plan progress report cadence.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add Guide as a Command Reference lane before Create. | Recent work made the reference searchable; the next useful step is making beginner/pro guidance surfaces discoverable without turning sampling into the center. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created for a read-only Guide lane in Command Reference and the first 10-plan progress report checkpoint. |
| 2026-06-20 | repo_cartographer | Added Guide to Command Reference section/filter data ahead of Create so guidance surfaces are discoverable before action lanes. |
| 2026-06-20 | harness_builder | Updated README, product, quality, and harness expectations for the UI-local Guide lane. |
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

- No blocking findings.
- Guide is a read-only Command Reference section/filter placed ahead of Create so users can discover direct beat-making guidance surfaces before action lanes.
- Guide entries are static labels only; they do not execute Quick Actions, mutate project data, persist filter/search state, alter command ranking, or change playback/save/load/export/Handoff behavior.
- Product, README, quality rules, and harness expectations all keep sampling out of the primary Command Reference path and preserve it as optional secondary scope.

## Completion Notes

plan-480 completed by adding a UI-local Guide lane to Command Reference, updating Quick Actions reference labels, and aligning docs/harness guardrails. This is the first requested 10-plan progress checkpoint after plan-470.
