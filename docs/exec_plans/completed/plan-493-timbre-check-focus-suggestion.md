# plan-493-timbre-check-focus-suggestion

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Add a Timbre Check focus suggestion that shows the current Sound Focus recommendation inside the read-only timbre scan and lets users explicitly apply that existing Sound Focus move from the same sound-design context.

## Non-Goals

- Do not change Timbre Check scoring, Sound Focus pad definitions, Sound Focus preview derivation, sound preset behavior, drum kit behavior, sound snapshot behavior, Studio tone controls, mixer/master behavior, playback, save/load, render/export, or Handoff behavior.
- Do not auto-apply sound changes, create hidden generation, add sampling/imported audio, change project schema, persist UI feedback, add remote AI, accounts, analytics, or cloud sync.
- Do not introduce new sound algorithms; use the existing Sound Focus preview and apply path.

## Context Map

- `src/ui/workstationComposePanels.tsx`: Sound panel, Timbre Check, and Sound Focus UI.
- `src/ui/App.tsx`: Sound Focus preview derivation and apply handler wiring.
- `src/styles.css`: Timbre Check layout.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Timbre Check and Sound Focus wiring.
- [x] Pass the existing Sound Focus preview and apply handler into Timbre Check.
- [x] Add a Timbre Check focus suggestion card with status, pad, target parameters, move count, and an explicit Apply Focus button.
- [x] Keep all mutation routed through the existing Sound Focus apply handler.
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

QA completes before review starts. Review should confirm the suggestion is derived from the existing Sound Focus preview, the Apply button uses the existing Sound Focus handler, and no scoring, persistence, schema, playback, export, sampling, or remote behavior changed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Reuse the existing Sound Focus preview inside Timbre Check instead of creating new timbre-fix logic. | This keeps tone guidance deterministic, explicit, and aligned with existing undoable sound-design controls. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make Timbre Check more actionable without changing sound algorithms or adding sampling. |
| 2026-06-20 | repo_cartographer | Passed the existing Sound Focus preview and apply handler into Timbre Check. |
| 2026-06-20 | harness_builder | Updated README, product, quality, and QA harness expectations for the Timbre Check focus suggestion. |
| 2026-06-20 | quality_runner | Ran the standard QA set; local dev server preview remained blocked by environment binding policy. |

## QA Results

| command | result | notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `python3 harness/scripts/run_qa.py` | pass | Documentation, source, and CSS expectations include the Timbre Check focus suggestion. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate accepted the updated surface. |
| `npm run typecheck` | pass | TypeScript validation passed. |
| `npm run build` | pass | Build passed with the existing Vite large chunk warning. |
| `npm run qa` | pass | Harness QA passed through the package script. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed; runtime smoke passed 14/14 blueprints and 14/14 style profiles. |
| `npm run dev -- --host 127.0.0.1` | blocked | Local preview could not bind in this environment: `listen EPERM` on `127.0.0.1:5173`. Escalated retry was rejected by environment policy. |

## Review

- No blocking findings.
- The Timbre Check focus suggestion is derived from the existing Sound Focus preview.
- Apply Focus routes only through the existing Sound Focus pad handler and remains an explicit user click.
- Timbre scoring, Sound Focus pad definitions, project schema, playback, save/load, render/export, Handoff, and sampling boundaries are unchanged.
- Browser preview remains unavailable until the environment permits local dev server binding.

## Completion Notes

Plan completed after QA and review. Move this file to `docs/exec_plans/completed/` and create the matching review mirror in `docs/reviews/`.
