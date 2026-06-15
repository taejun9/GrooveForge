# plan-052-beat-readiness

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add a read-only Beat Readiness panel that summarizes whether the current project has the core ingredients of a complete sample-free beat: drums, 808/bass, melody or chords, arrangement length/structure, and export/mix readiness. Beginners should know what is missing without reading manuals, while working producers should see useful project completeness signals without losing control.

## Non-Goals

- No automatic generation, automatic fixes, AI evaluation, remote calls, imported audio analysis, sampling workflow, plugin hosting, or project mutation.
- No replacement for Mix Coach or detailed meters.
- No new saved project fields or file migration.

## Context Map

- `src/ui/App.tsx`: top-level app state, project summaries, arrangement/mixer/master panels, Mix Coach.
- `src/domain/workstation.ts`: pattern, arrangement, and project data helpers.
- `src/styles.css`: layout and compact status presentation.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product/QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-052-beat-readiness` and `.worktree/plan-052-beat-readiness`.
- Preserve the beat-first product boundary: Beat Readiness must read editable musical-event and arrangement/export data, not imported audio or sampling state.

## Implementation Plan

- [x] Derive read-only readiness checks from current Pattern A/B/C data, arrangement length, and export analysis.
- [x] Render a compact Beat Readiness panel near the top-level session controls.
- [x] Keep checks deterministic, beginner-readable, and useful for producers without mutating project state.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: passed. Beat Readiness rendered 5 checks, toggling Kick step 1 off changed the drum readiness count from 63 to 62 arranged hits, export meter stayed present and updated, Play/Stop worked, and console errors were empty.

## Review Plan

QA completes before review starts. Review checks that Beat Readiness is read-only, deterministic, derived from editable beat project data, clear for beginners, useful for producers, does not add sample-first drift, and preserves playback/export semantics.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Build readiness from local project data instead of a wizard or generator. | Status checks help beginners orient without taking creative control away from working producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Selected Beat Readiness as the next slice because project completeness is the remaining top-level usability signal after Mix Coach covers mix interpretation. |
| 2026-06-15 | harness_builder | Added read-only Beat Readiness checks for drums, 808, melody/chords, arrangement, and export status. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify, diff whitespace check, and Browser Beat Readiness smoke. |
| 2026-06-15 | review_judge | Reviewed read-only behavior, deterministic project-data derivation, playback/export preservation, and beat-first boundary. |

## Completion Notes

Beat Readiness is implemented as a read-only top-level status panel. It summarizes drums, 808, melody/chords, arrangement, and export status from editable Pattern A/B/C, arrangement, and deterministic export analysis data. It does not mutate project state, generate events, add sampling workflows, or alter playback/export semantics.
