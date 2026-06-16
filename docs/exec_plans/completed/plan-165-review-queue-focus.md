# plan-165-review-queue-focus

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Turn Review Queue issues into explicit local focus controls, so beginners can click a queued issue and jump to the right workstation area while producers can scan and triage composition, arrangement, mix/master, target, and handoff issues faster.

## Non-Goals

- Do not change Review Queue prioritization, Beat Readiness checks, Structure Lens signals, Mix Coach scoring, deterministic export analysis, stem analysis, audio scheduling, render/export output, project schema, save/load migration, arrangement data, Pattern A/B/C event data, mixer/master values, snapshots, or Handoff data.
- Do not auto-apply fixes, auto-play audio, auto-export, auto-save, mutate project data, or hide existing controls.
- Do not replace Review Queue, Finish Checklist, Beat Map, Next Move, Workflow Navigator, Mix Coach, Mix Fix, Handoff Pack, or direct editing panels.
- Do not add sampling, imported audio, waveform analysis, remote AI, accounts, analytics, cloud sync, plugin hosting, or collaboration services.

## Context Map

- `src/ui/App.tsx`: Review Queue item type, summary creation, ReviewQueue component, workflow refs, project status updates.
- `src/styles.css`: Review Queue focus button and focused-item visual state.
- `README.md`: Review Queue product summary.
- `docs/product/product.md`: Review Queue feature description.
- `docs/quality/rules.md`: Review Queue focus guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-165-review-queue-focus` and `.worktree/plan-165-review-queue-focus` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Review Queue derivation, rendering, and workflow navigation refs.
- [x] Add UI-local Review Queue focus state and focus target metadata derived from existing issue ids/areas.
- [x] Render explicit Focus controls and focused-item styling without changing issue priority or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Local browser smoke for Review Queue focus controls, focused issue highlight, project status update, no Review Queue priority mutation, no auto-fix/autoplay/export, and unchanged Mix Coach/Mix Fix controls.

## Review Plan

QA completes before review starts. Review checks focus derivation from existing Review Queue items, UI-local state only, no recommendation/score/render/export/schema changes, no auto-fix or autoplay, no Review Queue regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add explicit Review Queue focus controls instead of changing issue priority. | The app already computes useful local review issues; navigation reduces beginner ambiguity and producer triage time without changing deterministic diagnostics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Review Queue Focus. |
| 2026-06-17 | harness_builder | Added Review Queue focus targets, Focus buttons, focused-item styling, and project status feedback as UI-local state. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations for Review Queue Focus. |
| 2026-06-17 | quality_runner | QA passed: run_qa, npm qa, typecheck, quality gate, verify, diff-check, and local browser smoke. |

## Completion Notes

Review Queue now exposes explicit Focus controls for queued issues and routes them to Compose, Arrange, Mix, Master, or Deliver panels from existing issue ids and areas. Browser smoke confirmed initial Top Review readout, no focused cards before click, Deliver focus for Session Brief, Master/Mix Coach focus for headroom, one focused Review Queue card at a time, unchanged Mix Fix buttons, no console warnings/errors, and no desktop horizontal overflow.
