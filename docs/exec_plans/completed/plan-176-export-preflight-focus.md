# plan-176-export-preflight-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Export Preflight cards into explicit local Focus controls so beginners can jump from readiness, mix/master, deliverables, and handoff risks into the relevant workstation surface, while producers can move from final delivery scan to Compose, Mix, Master, or Deliver without hunting through the dense app.

## Non-Goals

- Do not change Export Preflight scoring, Handoff Pack export buttons, WAV/stem/MIDI/Handoff Sheet file contents, Beat Readiness, Mix Coach, Delivery Targets, Session Brief storage, project schema, save/load migration, playback, render/export, Quick Actions, or Next Move command behavior.
- Do not auto-fix, auto-export, auto-render, auto-save, autoplay, hide existing controls, or change card priority.
- Do not add sampling, imported audio, remote AI, remote analysis, plugin hosting, accounts, analytics, cloud sync, platform compliance claims, publishing claims, licensing, LUFS/true-peak guarantees, or professional mastering promises.

## Context Map

- `src/ui/App.tsx`: Export Preflight card types, summary helper, focus state, workflow refs, component rendering.
- `src/styles.css`: Export Preflight layout, focus readout, focused-card and button styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Export Preflight focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-176-export-preflight-focus` and `.worktree/plan-176-export-preflight-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Export Preflight summary, card rendering, workflow refs, docs, and QA expectations.
- [x] Add UI-local Export Preflight focus state and focus target metadata derived only from existing readiness, mix/master, deliverables, and handoff cards.
- [x] Render Focus controls, focus readout, and focused-card state without changing scoring, exports, or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Export Preflight Focus controls render, focused card/readout updates, Compose/Mix/Master/Deliver scroll targets work, no scoring/export mutation, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Export Preflight cards, UI-local state only, no export/render/file/schema changes, no auto-fix/autoplay/autosave, no Handoff Pack regression, no layout regression, and no sampling/remote/platform-compliance scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add Export Preflight Focus without changing export behavior. | Delivery risk cards should lead to the surface that fixes the issue, but final file actions must stay explicit. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Export Preflight Focus. |
| 2026-06-17 | harness_builder | Added UI-local Export Preflight focus ids, target metadata, readout, Focus buttons, and focused-card state. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations for Export Preflight Focus guardrails. |
| 2026-06-17 | quality_runner | Ran QA, quality gate, typecheck, verify, diff check, and static dist token checks. Browser smoke was blocked by localhost listen EPERM and escalation rejection. |
| 2026-06-17 | review_judge | Reviewed the implementation after QA; no blocking issues found. |

## Completion Notes

Implemented Export Preflight Focus as a UI-local navigation layer. Readiness routes to Compose, Mix / Master routes to Master, and Deliverables plus Handoff route to Deliver. The focused card and readout state are not saved to project data.

Validation passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, `git diff --check`, and static dist/source token checks. Browser smoke could not run because the dev server failed with `listen EPERM` and the escalated retry was rejected by the environment policy. `npm run verify` still reports the existing Vite large chunk warning.
