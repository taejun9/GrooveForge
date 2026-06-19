# plan-501-review-fix-preview

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add a read-only Review Fix Preview so users can see the next explicit one-step fix before applying it from Review Queue.

## Non-Goals

- Do not change Review Queue priority, issue scoring, Review Fix action routing, Quick Actions command behavior, project schema, playback, render/export, save/load, or Handoff behavior.
- Do not auto-apply fixes, add command chains, add hidden generation, import audio, add sampling workflows, use remote AI, add accounts, analytics, or cloud sync.
- Do not persist preview state in project data, localStorage, or exported files.

## Context Map

- `src/ui/App.tsx`: Review Queue rendering, Review Fix option/result derivation, and fix handlers.
- `src/styles.css`: Review Queue and Review Fix result layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Review Queue focus/fix UI, types, CSS, docs, and harness checks.
- [x] Add a read-only Review Fix Preview summary derived from the focused fixable issue or current top fixable issue.
- [x] Render the preview in Review Queue before result feedback without changing existing Fix buttons or handlers.
- [x] Style the preview compactly for desktop and mobile layouts.
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

QA completes before review starts. Review should confirm the preview is read-only, derived only from local Review Queue/project/export state, keeps Fix application explicit, preserves Review Queue scoring and Review Fix routing, and does not introduce sampling, imported audio, remote AI, schema, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a preview strip instead of changing Fix execution. | Users need confidence about the next one-step action without reducing Review Queue to an auto-fix loop. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to expose the next explicit Review Fix before application. |
| 2026-06-20 | repo_cartographer | Added Review Fix Preview derivation, UI, CSS, README/product/quality docs, and harness expectations. |
| 2026-06-20 | quality_runner | Ran the standard QA set; local dev server preview remained blocked by environment binding policy. |
| 2026-06-20 | review_judge | Reviewed preview derivation and found no blocking issues. |

## QA Results

| command | result | notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `python3 harness/scripts/run_qa.py` | pass | Documentation, source, and CSS expectations include Review Fix Preview. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate accepted the updated surface. |
| `npm run typecheck` | pass | TypeScript validation passed. |
| `npm run build` | pass | Build passed with the existing Vite large chunk warning. |
| `npm run qa` | pass | Package QA passed. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed; runtime smoke passed 14/14 blueprints and 14/14 style profiles. |
| `npm run dev -- --host 127.0.0.1` | blocked | Local preview could not bind in this environment: `listen EPERM` on `127.0.0.1:5173`. Escalated retry was rejected by environment policy. |

## Review

- No blocking findings.
- Review Fix Preview is read-only and derives only from current Review Queue summary, UI-local focused item id, local project state, and deterministic export analysis.
- The preview selects the focused fixable issue first, then the current top fixable issue, and shows a clear state when no one-step fix exists.
- Existing Fix buttons and Quick Actions Review Fix command paths still route through the existing explicit undoable handlers.
- Review Queue priority, scoring, focus results, review-fix result feedback, project schema, playback, save/load, render/export, Handoff, and sampling boundaries are unchanged.
- Browser preview remains unavailable until the environment permits local dev server binding.

## Completion Notes

Plan completed after QA and review. Move this file to `docs/exec_plans/completed/` and create the matching review mirror in `docs/reviews/`.
