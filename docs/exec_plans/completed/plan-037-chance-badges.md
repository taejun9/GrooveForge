# plan-037-chance-badges

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Make chance-enabled events visible directly on the editing surface. Producers should be able to scan a drum, 808, melody, or chord pattern and immediately see which events are conditional, while beginners still see a clean grid when all events are at the default 100% chance.

## Non-Goals

- No new probability engine or render behavior changes.
- No sampling, audio import, chopping, sampler tracks, MIDI input, plugin hosting, or audio warping.
- No pass-by-pass prediction of which chance events will fire next.

## Context Map

- `src/ui/App.tsx`: drum step badges, note grid cells, chord slot headers.
- `src/styles.css`: compact badge styling and responsive layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: feature docs and quality guardrails.
- `harness/scripts/run_qa.py`: static validation expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep badges compact and non-overlapping; the grids must remain usable at desktop and narrower viewport widths.

## Implementation Plan

- [x] Add compact probability badges to active drum steps with chance below 100%.
- [x] Add compact probability badges to active 808/melody notes with chance below 100%.
- [x] Add compact probability badges to chord slots with chance below 100%.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, browser validation, review, and complete lifecycle.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser validation: set drum, 808, melody, and chord chance values below 100%, confirm badges render without overlap, confirm default 100% events stay visually clean, and confirm console errors are 0.

## Review Plan

QA completes before review starts. Review checks that badges are read-only visual indicators, do not change audio/export behavior, remain compact, do not introduce sampling-first drift, and preserve existing editing controls.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Show badges only when chance is below 100%. | The default beginner path should stay clean, while producer-oriented variation remains visible when used. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for chance visibility badges. |
| 2026-06-15 | harness_builder | Added compact chance badges to drum steps, 808/melody note cells, and chord slot headers when chance is below 100%. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for chance badges. |
| 2026-06-15 | quality_runner | Browser validation confirmed default 100% projects show 0 chance badges, then 60 drum, 80 note, and 70% chord badges render after chance edits with console errors at 0. |
| 2026-06-15 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` passed. |
| 2026-06-15 | review_judge | Created completion review mirror with no blocking findings. |

## Completion Notes

Chance badges are now read-only visual indicators on below-100% drum, 808, melody, and chord events. Default 100% projects stay visually clean, and playback/export behavior remains unchanged.
