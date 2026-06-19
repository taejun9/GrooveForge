# plan-496-studio-tone-baseline-memory

## Status

active

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Make Studio tone baseline/delta/reset remain useful after manual sound edits by remembering the last named preset baseline, or the initial custom tone when the session starts on a custom sound, inside UI-local Sound Designer state.

## Non-Goals

- Do not change sound preset definitions, Sound Focus pad definitions, Drum Kit Pad behavior, Sound Snapshot A/B behavior, Timbre Check scoring, mixer/master behavior, playback, save/load, render/export, Handoff behavior, or project schema.
- Do not persist baseline memory in project data, localStorage, or exported files.
- Do not add all-control reset, auto-reset, auto-apply, hidden generation, imported audio, sampling, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationComposePanels.tsx`: Sound Designer Studio tone baseline memory, source readout, reset result.
- `src/styles.css`: baseline-source readout layout.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Studio tone baseline/reset behavior.
- [x] Add UI-local baseline memory for last named preset or initial custom tone.
- [x] Show the active baseline source in Studio mode.
- [x] Keep per-control baseline, delta, Reset, and Reset Result derived from the remembered baseline.
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

QA completes before review starts. Review should confirm baseline memory is UI-local, named preset changes refresh the remembered baseline, custom/manual edits do not collapse baseline/delta to the current value, reset result uses the remembered baseline source, and project schema/playback/export/sampling boundaries are unchanged.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Remember the baseline in Sound Designer instead of adding project schema. | Reset should remain useful in the current editing session without persisting transient UI comparison state. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to keep Studio tone reset meaningful after manual sound edits switch the sound to custom. |
| 2026-06-20 | repo_cartographer | Added UI-local baseline memory, Studio baseline source readout, reset-result source labels, docs, and harness expectations. |
| 2026-06-20 | quality_runner | Ran the standard QA set; local dev server preview remained blocked by environment binding policy. |
| 2026-06-20 | review_judge | Reviewed baseline memory scope and found no blocking issues. |

## QA Results

| command | result | notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `python3 harness/scripts/run_qa.py` | pass | Documentation, source, and CSS expectations include Studio tone baseline memory. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate accepted the updated surface. |
| `npm run typecheck` | pass | TypeScript validation passed. |
| `npm run build` | pass | Build passed with the existing Vite large chunk warning. |
| `npm run qa` | pass | Package QA passed. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed; runtime smoke passed 14/14 blueprints and 14/14 style profiles. |
| `npm run dev -- --host 127.0.0.1` | blocked | Local preview could not bind in this environment: `listen EPERM` on `127.0.0.1:5173`. Escalated retry was rejected by environment policy. |

## Review

- No blocking findings.
- Studio tone baseline memory stays inside Sound Designer UI state and is not saved to project data.
- Named sound preset changes refresh the remembered baseline and clear stale reset feedback.
- Manual/custom edits keep the remembered baseline so per-control delta and Reset remain meaningful after `project.sound.preset` becomes `custom`.
- Reset result now reports the remembered baseline source.
- Sound preset definitions, Sound Focus, Drum Kit Pads, snapshots, project schema, playback, save/load, render/export, Handoff, and sampling boundaries are unchanged.
- Browser preview remains unavailable until the environment permits local dev server binding.

## Completion Notes

Plan completed after QA and review. Move this file to `docs/exec_plans/completed/` and create the matching review mirror in `docs/reviews/`.
