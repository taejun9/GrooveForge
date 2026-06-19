# plan-497-studio-tone-baseline-capture

## Status

active

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add an explicit UI-local Studio Tone Baseline Capture control so users can make the current custom sound design the new Reset baseline after they find a good tone.

## Non-Goals

- Do not change sound preset definitions, Sound Focus pad definitions, Drum Kit Pad behavior, Sound Snapshot A/B behavior, Timbre Check scoring, mixer/master behavior, playback, save/load, render/export, Handoff behavior, or project schema.
- Do not persist captured baseline state in project data, localStorage, or exported files.
- Do not add all-control reset, auto-reset, auto-apply, hidden generation, imported audio, sampling, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationComposePanels.tsx`: Sound Designer Studio tone baseline capture, source readout, reset result.
- `src/styles.css`: baseline capture controls and result layout.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Studio tone baseline memory behavior.
- [x] Add a visible Capture Baseline control in Studio mode.
- [x] Store captured baseline only in Sound Designer UI state.
- [x] Show a compact baseline capture result with captured tone posture and next check.
- [x] Keep per-control baseline, delta, Reset, and Reset Result derived from the captured baseline after capture.
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

QA completes before review starts. Review should confirm baseline capture is explicit, UI-local, and non-persistent; captured baseline values are derived from current `SoundDesign`; reset and delta readouts use the captured baseline after capture; and project schema/playback/export/sampling boundaries are unchanged.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add explicit Capture Baseline instead of auto-capturing manual edits. | Producers need control over when a custom tone becomes the reset target, and beginners need a clear safety point. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to let users capture a good custom sound as the Studio tone reset baseline. |
| 2026-06-20 | repo_cartographer | Added explicit Capture Baseline control, UI-local capture result, docs, and harness expectations. |
| 2026-06-20 | quality_runner | Ran the standard QA set; local dev server preview remained blocked by environment binding policy. |
| 2026-06-20 | review_judge | Reviewed baseline capture scope and found no blocking issues. |

## QA Results

| command | result | notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `python3 harness/scripts/run_qa.py` | pass | Documentation, source, and CSS expectations include Studio Tone Baseline Capture. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate accepted the updated surface. |
| `npm run typecheck` | pass | TypeScript validation passed. |
| `npm run build` | pass | Build passed with the existing Vite large chunk warning. |
| `npm run qa` | pass | Package QA passed. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed; runtime smoke passed 14/14 blueprints and 14/14 style profiles. |
| `npm run dev -- --host 127.0.0.1` | blocked | Local preview could not bind in this environment: `listen EPERM` on `127.0.0.1:5173`. Escalated retry was rejected by environment policy. |

## Review

- No blocking findings.
- Capture Baseline is a visible explicit Studio mode control.
- Captured baseline state and captured-baseline result stay UI-local inside Sound Designer and are not persisted in project data.
- Captured baseline values are cloned from the current `SoundDesign`, and subsequent per-control baseline/delta/reset labels derive from that captured baseline.
- Capture clears stale reset feedback and shows a compact captured tone posture plus next-check result.
- Sound preset definitions, Sound Focus, Drum Kit Pads, snapshots, project schema, playback, save/load, render/export, Handoff, and sampling boundaries are unchanged.
- Browser preview remains unavailable until the environment permits local dev server binding.

## Completion Notes

Plan completed after QA and review. Move this file to `docs/exec_plans/completed/` and create the matching review mirror in `docs/reviews/`.
