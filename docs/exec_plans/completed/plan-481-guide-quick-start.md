# plan-481-guide-quick-start

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add a Guide Quick Start strip near the top of the workstation that combines the current First Beat Path step, Session Pass lane, and Workflow Spotlight target into one visible direct beat-making launch point.

## Non-Goals

- Do not change First Beat Path, Session Pass, Workflow Navigator, Quick Actions, command execution, command ranking, mode switching, project schema, undo/redo history, playback, save/load, render/export, Handoff, or local draft behavior.
- Do not persist Guide Quick Start state or create new command chains, macros, auto-run behavior, tutorial flows, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not make sample browsing, chopping, sampler setup, or imported audio part of the primary start path.

## Context Map

- `src/ui/workstationGuidancePanels.tsx`: Mode/Path/Session/Workflow guidance components and derived spotlight helper.
- `src/ui/App.tsx`: top workstation layout, guidance summaries, and jump/focus handlers.
- `src/styles.css`: guidance panel layout and responsive behavior.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect existing guide summaries, handlers, and top-of-app layout.
- [x] Add Guide Quick Start derived from existing guidance summaries and existing jump/focus handlers.
- [x] Style the strip so it is compact, responsive, and does not crowd the transport/header flow.
- [x] Update docs and harness expectations for the new direct beat-making launch strip.
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

QA completes before review starts. Review should confirm Guide Quick Start is UI-local, derives from existing guidance summaries, routes only through existing explicit jump/focus handlers, does not mutate project data by itself, and keeps the first visible guidance path centered on direct beat composition rather than sampling.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a compact Guide Quick Start strip above the existing detailed guide panels. | Beginners need one visible next step, while producers need a fast scan/jump surface without opening Command Reference or searching Quick Actions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to expose the next direct beat-making guide step without changing project data or command execution. |
| 2026-06-20 | repo_cartographer | Added Guide Quick Start above the detailed guidance panels, deriving Path, Session, and Workflow actions from existing summaries. |
| 2026-06-20 | harness_builder | Updated README, product, quality, and harness expectations for the UI-local launch strip and existing handler routing. |
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
- Guide Quick Start derives Path, Session, and Workflow actions only from existing First Beat Path, Session Pass, and Workflow Navigator/Spotlight summaries.
- Its buttons call only existing `jumpToFirstBeatPathStep`, `focusSessionPassCard`, and `jumpToWorkflowNavigatorItem` handlers.
- The strip does not create project schema, persistence, command chains, auto-run behavior, playback changes, save/load changes, export changes, Handoff changes, or sampling-first onboarding.
- Product, README, quality rules, and harness expectations now record the strip as a direct beat-making launch surface.

## Completion Notes

plan-481 completed by adding a compact Guide Quick Start strip near the top of the workstation, routing all visible actions through existing explicit guide jump/focus handlers, and aligning docs/harness guardrails.
