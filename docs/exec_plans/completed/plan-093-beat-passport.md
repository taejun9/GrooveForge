# plan-093-beat-passport

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Goal

Add a read-only Beat Passport summary that gives beginners and producers a fast scan of target, arrangement length, Pattern A/B/C use, readiness, export status, stem signal, and master posture from existing local project/render state.

## Non-Goals

- No new project schema fields.
- No mutation of musical events, arrangement, mixer, master, Session Brief, snapshots, or export commands.
- No sampling, imported audio, plugin hosting, remote AI, accounts, analytics, cloud sync, LUFS, true-peak, platform compliance, or professional mastering guarantees.
- No modal tutorial, landing page, or sampler-first UI.

## Context Map

- `src/ui/App.tsx`: Beat Readiness, Beat Map, export/stem analysis, component placement.
- `src/styles.css`: compact summary strip styles.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product workflow and QA boundary updates.
- `harness/scripts/run_qa.py`: static expectations for docs/source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-093-beat-passport` and `.worktree/plan-093-beat-passport` for git repository work.
- Beat Passport must be derived only from local project state, Beat Readiness checks, deterministic export analysis, deterministic stem analysis, selected Delivery Target, and master state.
- The UI must stay compact and scan-friendly; it should not add instructional copy or sample-import assumptions.

## Implementation Plan

- [x] Add Beat Passport summary types and deterministic helper functions.
- [x] Render a compact read-only Beat Passport strip near Beat Map/Readiness.
- [x] Add CSS with stable responsive dimensions and no layout overlap.
- [x] Update docs and QA expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Beat Passport renders target/length/pattern/readiness/export/stems/master values, updates after a Pattern Chain action, has no console errors, and has no horizontal overflow.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that Beat Passport remains read-only, local, deterministic, compact, and free of sampling/imported-audio framing.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Beat Passport before new generation features. | A compact production summary improves beginner orientation and professional scanning without changing audio/render semantics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Beat Passport. |
| 2026-06-16 | harness_builder | Added read-only Beat Passport summary from existing local project, readiness, export, stem, target, and master state. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for Beat Passport while preserving beat-first/sampling-optional framing. |
| 2026-06-16 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `npm run verify`, browser smoke, `npm run qa`, and `git diff --check`. |

## Completion Notes

Beat Passport now renders target, length, Pattern A/B/C use, readiness, export, stems, and master posture as a compact read-only strip. Browser smoke confirmed it renders seven cards, updates after applying 8 Bar Chain, and keeps console errors and horizontal overflow clear.
