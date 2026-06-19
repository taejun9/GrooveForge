# plan-475-arrange-command-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Make song structure and arrangement work easier to discover from the read-only Command Reference by adding an Arrange section for existing Pattern Chain, Chain Expand, Arrangement Template, Arrangement Arc, Arrangement Focus, Arrangement Move, Section Locator, Song Form Overview, Arrangement Mute Map, Arrangement Transition Map, Arrangement Playback Readout, and Audible Arrangement Follow surfaces.

## Non-Goals

- Do not change arrangement handlers, arrangement block data, Pattern Chain behavior, template/arc/focus/move handlers, Section Locator behavior, Song Form Overview derivation, Mute Map, Transition Map, playback, loop scope, project schema, undo/redo history, save/load, render/export, Handoff, or Command Reference open/close behavior.
- Do not add auto-arrangement, hidden generation, command chains, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or destructive arrangement rewrites.
- Do not make Command Reference execute commands; it remains static/read-only guidance.

## Context Map

- `src/ui/workstationShellPanels.tsx`: read-only Command Reference sections and rendered command map.
- `src/ui/App.tsx`: existing Arrange Quick Actions, Arrangement readouts, and Command Reference result label.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect existing Arrange-related command labels and current Command Reference wording.
- [x] Add a read-only Arrange section and keep Finish focused on master/delivery surfaces.
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

QA completes before review starts. Review should confirm the Command Reference remains read-only, documents only existing arrangement surfaces, and preserves arrangement data, playback, loop scope, undo/redo, save/load, export, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add an Arrange section to Command Reference and keep Finish focused on master/delivery. | Arrangement is a core beat-making stage; users need to find song-form tools separately from finishing tools. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make existing arrangement and song-form controls easier to discover from the desktop command map. |
| 2026-06-20 | repo_cartographer | Added a read-only Arrange section to Command Reference for existing arrangement, song-form, playback readout, and audible follow surfaces. |
| 2026-06-20 | harness_builder | Updated README, product, quality, and harness expectations so Arrange command-map coverage is enforced. |
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

- Command Reference now has a dedicated read-only Arrange section for existing Pattern Chain, Chain Expand, Arrangement Template, Arrangement Arc, Arrangement Focus, Arrangement Move, Section Locator, Song Form Overview, Arrangement Mute Map, Arrangement Transition Map, Arrangement Playback Readout, and Audible Arrangement Follow surfaces.
- Finish no longer carries arrangement rows that belong to the Arrange stage, so the Finish section stays focused on master, automation, handoff, and export surfaces.
- No arrangement handlers, project data, playback, loop scope, undo/redo, save/load, export, Handoff, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior was changed.

## Completion Notes

plan-475 completed by adding Arrange Command Reference coverage and matching docs/harness guardrails. Browser verification was not possible because the managed sandbox blocked the local dev server and the escalated retry was rejected.
