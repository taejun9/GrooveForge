# plan-499-studio-tone-largest-drift-reset

## Status

active

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add an explicit Reset Largest Drift control to Studio Tone Drift Summary so users can reset only the most-changed Studio tone control back to the remembered/captured baseline.

## Non-Goals

- Do not change sound preset definitions, Sound Focus pad definitions, Drum Kit Pad behavior, Sound Snapshot A/B behavior, Timbre Check scoring, mixer/master behavior, playback, save/load, render/export, Handoff behavior, or project schema.
- Do not persist drift reset UI state in project data, localStorage, or exported files.
- Do not auto-reset, auto-capture, auto-apply, reset every control, hide generation behind the summary, add imported audio, sampling, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationComposePanels.tsx`: Sound Designer Studio tone baseline capture/reset, drift summary, and largest-drift reset.
- `src/styles.css`: largest-drift reset button layout.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Studio tone drift summary and reset behavior.
- [x] Extend drift summary with the largest changed control target.
- [x] Add a visible Reset Largest control that is disabled when no drift exists.
- [x] Route Reset Largest through the existing Sound Designer `onChange` path for only the largest changed parameter.
- [x] Reuse Studio Tone Reset Result feedback for the largest-drift reset.
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

QA completes before review starts. Review should confirm Reset Largest is explicit, disabled without drift, updates only the largest changed SoundDesign parameter through the existing Sound Designer update path, reuses reset-result feedback, and preserves baseline capture/reset, project schema, playback, export, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a single largest-drift reset instead of broad reset. | Users need one safe correction target without losing deliberate custom tone edits. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to add an explicit one-control reset path from Studio Tone Drift Summary. |
| 2026-06-20 | repo_cartographer | Added Reset Largest Drift target derivation, button, reset-result reuse, docs, and harness expectations. |
| 2026-06-20 | quality_runner | Ran the standard QA set; local dev server preview remained blocked by environment binding policy. |
| 2026-06-20 | review_judge | Reviewed largest-drift reset behavior and found no blocking issues. |

## QA Results

| command | result | notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `python3 harness/scripts/run_qa.py` | pass | Documentation, source, and CSS expectations include Reset Largest Drift. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate accepted the updated surface. |
| `npm run typecheck` | pass | TypeScript validation passed. |
| `npm run build` | pass | Build passed with the existing Vite large chunk warning. |
| `npm run qa` | pass | Package QA passed. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed; runtime smoke passed 14/14 blueprints and 14/14 style profiles. |
| `npm run dev -- --host 127.0.0.1` | blocked | Local preview could not bind in this environment: `listen EPERM` on `127.0.0.1:5173`. Escalated retry was rejected by environment policy. |

## Review

- No blocking findings.
- Reset Largest Drift is explicit and disabled when no drift exists.
- The reset target is derived only from current `SoundDesign`, `studioToneControls`, and the remembered/captured baseline.
- Reset Largest Drift updates only the largest changed SoundDesign parameter through the existing Sound Designer update path.
- Reset Largest Drift reuses Studio Tone Reset Result feedback with before, baseline, baseline source, delta-to-zero, and next-check labels.
- Capture Baseline, per-control baseline/delta, per-control Reset, project schema, playback, save/load, render/export, Handoff, and sampling boundaries are unchanged.
- Browser preview remains unavailable until the environment permits local dev server binding.

## Completion Notes

Plan completed after QA and review. Move this file to `docs/exec_plans/completed/` and create the matching review mirror in `docs/reviews/`.
