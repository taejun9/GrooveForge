# plan-494-studio-tone-reset

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add preset-reference delta readouts and explicit per-control Reset buttons to Studio tone controls so users can safely experiment with sound design and quickly return individual tone parameters to the current preset baseline.

## Non-Goals

- Do not change sound preset definitions, Sound Focus pad definitions, Timbre Check scoring, Sound Snapshot A/B behavior, Sound Preset/Drum Kit/Sound Focus apply behavior, mixer/master behavior, playback, save/load, render/export, or Handoff behavior.
- Do not reset all sound controls at once, auto-reset, auto-apply, create hidden generation, add sampling/imported audio, change project schema, persist UI feedback, add remote AI, accounts, analytics, or cloud sync.
- Do not introduce new sound algorithms; use the existing current sound preset baseline.

## Context Map

- `src/ui/workstationComposePanels.tsx`: Sound Designer Studio tone controls.
- `src/domain/workstation.ts`: sound preset baseline data and labels.
- `src/styles.css`: Studio tone control layout.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Studio tone controls and current preset baseline access.
- [x] Show per-control preset baseline and current delta readouts.
- [x] Add explicit per-control Reset buttons that update only the matching SoundDesign parameter through the existing `onChange` path.
- [x] Keep manual slider and numeric input behavior unchanged.
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

QA completes before review starts. Review should confirm reset buttons use current preset baseline values, update only one SoundDesign parameter through the existing Sound Designer update path, and preserve sound presets, focus pads, snapshots, project schema, playback, export, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add per-control reset instead of a global sound reset. | Individual reset supports safe experimentation without wiping deliberate tone edits across the full sound design. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make Studio tone controls safer and faster for manual sound design. |
| 2026-06-20 | repo_cartographer | Added current-preset baseline and delta readouts to Studio tone controls. |
| 2026-06-20 | harness_builder | Added per-control Reset controls routed through the existing Sound Designer update path and updated docs/harness expectations. |
| 2026-06-20 | quality_runner | Ran the standard QA set; local dev server preview remained blocked by environment binding policy. |

## QA Results

| command | result | notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `python3 harness/scripts/run_qa.py` | pass | Documentation, source, and CSS expectations include Studio tone baseline/delta/reset controls. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate accepted the updated surface. |
| `npm run typecheck` | pass | TypeScript validation passed. |
| `npm run build` | pass | Build passed with the existing Vite large chunk warning. |
| `npm run qa` | pass | Harness QA passed through the package script. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed; runtime smoke passed 14/14 blueprints and 14/14 style profiles. |
| `npm run dev -- --host 127.0.0.1` | blocked | Local preview could not bind in this environment: `listen EPERM` on `127.0.0.1:5173`. Escalated retry was rejected by environment policy. |

## Review

- No blocking findings.
- Each Studio tone control now shows the current-preset baseline and current delta.
- Reset is per-control, disabled when already matching the baseline, and routes only through the existing Sound Designer `onChange` path for the clicked SoundDesign parameter.
- Sound preset definitions, Sound Focus pads, Timbre Check scoring, snapshots, project schema, playback, save/load, render/export, Handoff, and sampling boundaries are unchanged.
- Browser preview remains unavailable until the environment permits local dev server binding.

## Completion Notes

Plan completed after QA and review. Move this file to `docs/exec_plans/completed/` and create the matching review mirror in `docs/reviews/`.
