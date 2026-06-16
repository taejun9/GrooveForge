# plan-164-mix-coach-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Make Mix Check actions focus the highest-priority Mix Coach card and show a compact focus readout, so beginners know which mix issue to inspect first and working producers can jump directly to the relevant check.

## Non-Goals

- Do not change Mix Coach scoring thresholds, deterministic export analysis, stem analysis, audio scheduling, audio synthesis, realtime mixer math, render/export output, project schema, save/load migration, arrangement data, Pattern A/B/C event data, sound design, master, snapshots, or Handoff state.
- Do not auto-apply Mix Fixes, auto-adjust mixer/master controls, auto-play audio, auto-export, or create new recommendations.
- Do not replace Mix Coach, Mix Fix buttons, Export Meter, Master Output Role Readout, Next Move, Beat Map, Review Queue, Finish Checklist, or Handoff Pack.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, or plugin hosting.

## Context Map

- `src/ui/App.tsx`: Mix Coach checks, Mix Check command routing, Master panel rendering, Next Move result behavior.
- `src/styles.css`: Mix Coach focus readout and focused card visual state.
- `README.md`: Mix Coach/Mix Check summary.
- `docs/product/product.md`: mixer/master workflow descriptions.
- `docs/quality/rules.md`: Mix Coach focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-164-mix-coach-focus` and `.worktree/plan-164-mix-coach-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Mix Check routing and Mix Coach card rendering.
- [x] Add UI-local Mix Coach focus state derived from current Mix Coach checks.
- [x] Highlight the focused Mix Coach card and show a compact focus readout without changing check scoring.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Local browser smoke for initial Mix Coach, Mix Check focus, focused-card highlight, and Mix Fix behavior remaining explicit.

## Review Plan

QA completes before review starts. Review checks UI-local focus derivation from existing Mix Coach checks, no scoring/render/export/schema changes, no auto-fix or autoplay, no Mix Coach/Mix Fix regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Focus the top non-good Mix Coach card when Mix Check runs. | The app already routes users to Mix Coach; highlighting the relevant card reduces ambiguity without changing deterministic mix checks. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Mix Coach Focus. |
| 2026-06-17 | harness_builder | Added UI-local Mix Coach focus state, readout, and focused-card rendering from existing deterministic Mix Coach checks. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations for Mix Coach Focus. |
| 2026-06-17 | quality_runner | QA passed: run_qa, npm qa, typecheck, quality gate, verify, diff-check, and local browser smoke. |

## Completion Notes

Mix Check now focuses the highest-priority current Mix Coach card, shows a compact focus readout, and keeps Mix Fix actions explicit. Browser smoke confirmed initial Top Mix Check readout, post-click Focused Mix Check state, one focused Mix Coach card, unchanged Mix Fix buttons, no console warnings/errors, and no desktop horizontal overflow. The existing app-level mobile `body min-width: 1120px` remains outside this plan; the new readout text stays clipped inside its parent rather than overlapping.
