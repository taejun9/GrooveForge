# plan-500-listening-pass-focus-readout

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add a Listening Pass Focus Readout so the current or highest-priority listening checkpoint is always visible before the user focuses a panel.

## Non-Goals

- Do not change Listening Pass scoring, Beat Readiness checks, Review Queue fixes, Mix Coach checks, export analysis, playback, render/export, save/load, project schema, or Quick Actions command behavior.
- Do not add autoplay, auto-fixes, hidden generation, remote analysis, imported audio, sampling, accounts, analytics, or cloud sync.
- Do not persist Listening Pass focus UI state in project data, localStorage, or exported files.

## Context Map

- `src/ui/App.tsx`: Listening Pass rendering and focus result derivation.
- `src/ui/workstationUiModel.ts`: Listening Pass UI model types.
- `src/styles.css`: Listening Pass layout and compact readout styling.
- `docs/quality/rules.md`: direct beat-production and Listening Pass behavior expectations.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Listening Pass component, types, CSS, docs, and harness checks.
- [x] Add a read-only Listening Pass Focus Summary type and derivation helper.
- [x] Render the focus readout above Listening Pass result/cards, selecting the focused item or top-priority item.
- [x] Style the readout without changing card layout or score behavior.
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

QA completes before review starts. Review should confirm the readout is read-only, derived only from current Listening Pass summary/focus state, keeps direct beat composition first, preserves Listening Pass scoring and focus results, and does not introduce sampling, imported audio, remote AI, schema, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Focus Readout instead of another auto-fix. | Listening Pass should guide audition decisions while leaving explicit creation and editing controls in the existing panels. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to keep the next listening checkpoint visible in the direct beat-production workflow. |
| 2026-06-20 | repo_cartographer | Added the Listening Pass Focus Readout type, helper, UI, CSS, README note, and harness expectations. |
| 2026-06-20 | quality_runner | Ran the standard QA set; local dev server preview remained blocked by environment binding policy. |
| 2026-06-20 | review_judge | Reviewed readout derivation and found no blocking issues. |

## QA Results

| command | result | notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `python3 harness/scripts/run_qa.py` | pass | Documentation, source, and CSS expectations include Listening Pass Focus Readout. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate accepted the updated surface. |
| `npm run typecheck` | pass | TypeScript validation passed. |
| `npm run build` | pass | Build passed with the existing Vite large chunk warning. |
| `npm run qa` | pass | Package QA passed. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed; runtime smoke passed 14/14 blueprints and 14/14 style profiles. |
| `npm run dev -- --host 127.0.0.1` | blocked | Local preview could not bind in this environment: `listen EPERM` on `127.0.0.1:5173`. Escalated retry was rejected by environment policy. |

## Review

- No blocking findings.
- Listening Pass Focus Readout is read-only and derives only from the current Listening Pass summary plus UI-local focused item id.
- The readout selects the explicitly focused checkpoint, then the highest-priority non-good checkpoint, then the first checkpoint when all passes are ready.
- Focus Result remains click/command gated and still uses the existing focus handler.
- Listening Pass scoring, checkpoint order, focus buttons, Quick Actions behavior, project schema, playback, render/export, save/load, and sampling boundaries are unchanged.
- Browser preview remains unavailable until the environment permits local dev server binding.

## Completion Notes

Plan completed after QA and review. Move this file to `docs/exec_plans/completed/` and create the matching review mirror in `docs/reviews/`.
